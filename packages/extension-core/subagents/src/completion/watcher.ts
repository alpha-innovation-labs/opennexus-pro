import type { RunEntry, RunningRegistry } from "../running";
import { classifyCompletion, isRealFinalMessage } from "./classify";
import { extractFinalAssistantMessage, readRunTail } from "./session-tail";
import { readExitSidecar } from "./sidecar";
import type {
	CompletionWatcherHandle,
	CompletionWatcherOptions,
	StableSummaryReaperOptions,
} from "./types";

/**
 * Completion watcher.
 *
 * One watcher per run. It owns the two things the running-registry deliberately does
 * not own: it drives the run's completion to a terminal state and it reaps an idle
 * auto-exit run. It is created against a registered run and drives that run's
 * completion promise.
 *
 * **Detection.** The watcher waits on the child's `exit` event (the primary signal).
 * When it fires, the watcher reads the other two signals — the exit sidecar (the
 * intent the exit code alone does not carry) and the session tail (the final assistant
 * message) — and hands all three to the classifier. An `error` event (a spawn failure
 * that produces no `exit`) settles the run the same way so a completion promise never
 * hangs.
 *
 * **Classification.** The three signals are classified in {@link classifyCompletion}:
 * the sidecar reason overrides the exit code, the tail discriminates before the exit
 * code, and the stop intent decides cancelled versus a close after a real answer.
 *
 * **Stable-summary reaper.** For auto-exit runs the watcher also re-reads the session
 * tail on a short interval while the process is still alive. When the last assistant
 * message is a real answer and it is stable for the grace period with no new entries,
 * the watcher ends the process group. This ends runs that would otherwise sit idle
 * after finishing, so completion does not depend on the child remembering to
 * terminate itself. A reaper-ended run is not a stop-on-request: it has a real final
 * message and classifies completed.
 *
 * Target: context/extension/subagents/completion.md.
 */

/** The default grace period the last assistant message must be stable before reaping. */
const DEFAULT_REAPER_GRACE_MS = 2500;

/** The default interval between tail re-reads while the process is alive. */
const DEFAULT_REAPER_POLL_MS = 250;

/** The default signal the reaper and an explicit stop send to the process group. */
const DEFAULT_STOP_SIGNAL: NodeJS.Signals = "SIGTERM";

/**
 * Create a completion watcher for a registered run.
 *
 * The watcher attaches to the child's `exit` and `error` events, subscribes to the
 * run's abort signal, and (for auto-exit runs) starts the stable-summary reaper. It
 * drives the run's completion promise to a terminal state and then records the
 * classified completion in the registry (moving the run to the completed map).
 *
 * @param registry The running registry the run is registered in.
 * @param run The registered run (a live entry with the child handle and completion
 *   promise).
 * @param options Optional configuration (auto-exit vs. interactive, the reaper, the
 *   clock).
 * @returns A handle with the run's completion promise, a `stop` that ends the run on
 *   request, and a `dispose` that tears the watcher down.
 */
export function createCompletionWatcher(
	registry: RunningRegistry,
	run: RunEntry,
	options: CompletionWatcherOptions = {},
): CompletionWatcherHandle {
	const watcher = new CompletionWatcher(registry, run, options);
	return {
		runId: run.id,
		completion: run.completion,
		stop: watcher.stop,
		dispose: watcher.dispose,
	};
}

class CompletionWatcher {
	readonly #registry: RunningRegistry;
	readonly #run: RunEntry;
	readonly #autoExit: boolean;
	readonly #now: () => string;
	readonly #reaperOpts: StableSummaryReaperOptions;

	readonly #onExit: (
		code: number | null,
		signal: NodeJS.Signals | null,
	) => void;
	readonly #onError: (err: Error) => void;
	readonly #onAbort: () => void;
	readonly stop: (reason?: string) => void;
	readonly dispose: () => void;

	#settled = false;
	#stoppedOnRequest = false;
	#stopReason: string | undefined;
	#spawnError: string | undefined;
	#disposed = false;
	#reaperTimer: ReturnType<typeof setTimeout> | undefined;
	#lastSeenCount: number | null = null;
	#lastSeenSummary: string | null = null;
	#lastStableAtMs: number | null = null;

	constructor(
		registry: RunningRegistry,
		run: RunEntry,
		options: CompletionWatcherOptions,
	) {
		this.#registry = registry;
		this.#run = run;
		this.#autoExit = options.autoExit ?? true;
		this.#now = options.now ?? (() => new Date().toISOString());
		this.#reaperOpts = options.reaper ?? {};

		// The primary signal: the child's exit event. `once` because a process exits
		// exactly once.
		this.#onExit = (code, signal) => {
			this.#finish({ exitCode: code, signal: signal ?? undefined });
		};

		// A spawn failure emits `error` and never `exit`; settle so the promise hangs
		// for no one. Idempotent with the exit path (the first to settle wins).
		this.#onError = (err) => {
			this.#spawnError = err.message;
			this.#finish({ exitCode: null, signal: undefined });
		};

		// The registry aborts this controller on stop or on completion; either way the
		// watcher's loops stop.
		this.#onAbort = () => {
			this.#disposeLoops();
		};

		run.child.once("exit", this.#onExit);
		run.child.once("error", this.#onError);
		run.signal.addEventListener("abort", this.#onAbort);

		if (this.#autoExit) this.#scheduleReaper();

		// A single stable method bodies the two public operations so `this` is bound.
		this.stop = (reason?: string) => {
			if (this.#settled) return;
			this.#stoppedOnRequest = true;
			this.#stopReason = reason;
			// An explicit stop is authoritative; the reaper must not race it.
			this.#disposeLoops();
			this.#killGroup(this.#reaperOpts.signal ?? DEFAULT_STOP_SIGNAL);
		};
		this.dispose = () => {
			if (this.#disposed) return;
			this.#disposed = true;
			this.#disposeLoops();
			this.#run.child.removeListener("exit", this.#onExit);
			this.#run.child.removeListener("error", this.#onError);
			this.#run.signal.removeEventListener("abort", this.#onAbort);
		};
	}

	/**
	 * Read the two non-exit signals and classify the run, then record the classified
	 * completion in the registry (which settles the promise and moves the run to the
	 * completed map). Idempotent: the first signal to fire wins.
	 */
	#finish(input: { exitCode: number | null; signal?: string }): void {
		if (this.#settled) return;
		this.#settled = true;
		this.#disposeLoops();

		const run = this.#run;
		const sidecar = readExitSidecar(run.sessionPath);
		const finalMessage = extractFinalAssistantMessage(
			run.sessionPath,
			run.entryCountAtLaunch,
		);
		let completion = classifyCompletion(
			{
				exitCode: input.exitCode,
				signal: input.signal,
				sidecar,
				finalMessage,
				stoppedOnRequest: this.#stoppedOnRequest,
				interactive: !this.#autoExit,
			},
			{ now: this.#now },
		);

		// Fold in intent the classifier does not see: a spawn error (why a failed run
		// failed) and an explicit stop reason (what the stop was for).
		let detail = completion.detail;
		if (completion.status === "failed" && this.#spawnError !== undefined) {
			detail = detail
				? `${detail} (spawn error: ${this.#spawnError})`
				: this.#spawnError;
		} else if (this.#stoppedOnRequest && this.#stopReason !== undefined) {
			detail = this.#stopReason;
		}
		if (detail !== undefined && detail !== completion.detail) {
			completion = { ...completion, detail };
		}

		// `markCompleted` is idempotent: an already-completed run is found (not
		// re-settled) and the first result wins. The exact id cannot be ambiguous.
		this.#registry.markCompleted(run.id, completion);
	}

	/**
	 * The stable-summary reaper loop. For auto-exit runs only. While the process is
	 * alive, re-read the tail; when the last assistant message is a real answer and it
	 * has been stable (unchanged text and no new entries) for the grace period, end the
	 * process group.
	 */
	#scheduleReaper(): void {
		if (this.#settled || this.#disposed) return;
		if (this.#reaperTimer !== undefined) return;
		const pollMs = this.#reaperOpts.pollMs ?? DEFAULT_REAPER_POLL_MS;
		this.#reaperTimer = setTimeout(() => {
			this.#reaperTick();
		}, pollMs);
	}

	#reaperTick(): void {
		this.#reaperTimer = undefined;
		if (this.#settled || this.#disposed || this.#stoppedOnRequest) return;

		const run = this.#run;
		const tail = readRunTail(run.sessionPath, run.entryCountAtLaunch);
		const summary = tail.finalMessage;

		const stable = summary !== null && isRealFinalMessage(summary);
		if (stable) {
			const nowMs = Date.now();
			const unchanged =
				this.#lastSeenCount === tail.nonHeaderCount &&
				this.#lastSeenSummary === summary.text;
			if (!unchanged) {
				// A new answer or new activity: (re)anchor the grace window.
				this.#lastSeenCount = tail.nonHeaderCount;
				this.#lastSeenSummary = summary.text;
				this.#lastStableAtMs = nowMs;
			} else if (this.#lastStableAtMs !== null) {
				const graceMs = this.#reaperOpts.graceMs ?? DEFAULT_REAPER_GRACE_MS;
				if (nowMs - this.#lastStableAtMs >= graceMs) {
					// Stable for the grace period with no new entries: end the group.
					// Not a stop-on-request — the run finished, the reaper just reaps
					// the idle process. The exit handler classifies it completed.
					this.#killGroup(this.#reaperOpts.signal ?? DEFAULT_STOP_SIGNAL);
					return;
				}
			}
		} else {
			// No real final message yet (or still changing): not stable; drop the window.
			this.#lastSeenCount = null;
			this.#lastSeenSummary = null;
			this.#lastStableAtMs = null;
		}

		if (!this.#settled && !this.#disposed && !this.#stoppedOnRequest) {
			this.#scheduleReaper();
		}
	}

	/**
	 * Signal the run's whole process group (the negative pid) so the child and anything
	 * it spawned end together. A no-op if the group already exited (ESRCH).
	 */
	#killGroup(signal: NodeJS.Signals): void {
		try {
			process.kill(-this.#run.processGroupId, signal);
		} catch {
			// ESRCH: the group already exited between the decision and the signal.
		}
	}

	/** Stop the reaper timer without ending the run. */
	#disposeLoops(): void {
		if (this.#reaperTimer !== undefined) {
			clearTimeout(this.#reaperTimer);
			this.#reaperTimer = undefined;
		}
	}
}
