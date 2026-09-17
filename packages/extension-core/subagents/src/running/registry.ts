import type { ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
	AmbiguousRunNameError,
	DuplicateRunIdError,
	RunNotFoundError,
} from "./errors";
import { OutputTail } from "./tail";
import type {
	RegisterRunInput,
	RunCompletion,
	RunEntry,
	RunningRegistryOptions,
} from "./types";

/**
 * The parent's in-memory running registry, keyed by run id.
 *
 * The map is the parent's fast path for the operations a turn performs by
 * name: find it, wait on it, stop it. Each entry holds handles and short-lived
 * data only — the child process handle and its process group, the completion
 * promise, the session file path, the start time and the number of session
 * entries at launch, the stdout/stderr tails, and the abort controller that
 * stops the watcher loop.
 *
 * Lookup is exact id first, then name. A name that matches more than one run
 * is an error that names the ambiguity and points the caller at the id.
 *
 * Completed runs move to a separate completed map so a result can be re-read
 * and delivered more than once without the run still appearing live.
 *
 * The registry is deliberately not durable: the session file is the record,
 * the registry is a handle index. See context/extension/subagents/running-registry.md.
 */

/** The default size of each stdout/stderr tail: the last few kilobytes. */
const DEFAULT_TAIL_BYTES = 4096;

/**
 * Generate an 8-hex-char run id that does not collide with `takenIds`.
 * Falls back to a full UUID if 100 short attempts collide.
 */
function generateShortId(takenIds: ReadonlySet<string>): string {
	for (let i = 0; i < 100; i++) {
		const id = randomUUID().slice(0, 8);
		if (!takenIds.has(id)) return id;
	}
	return randomUUID();
}

/**
 * Coerce a stream data chunk to bytes. Readable streams emit Buffer by
 * default; a string is accepted for a stream with an encoding set.
 */
function asBytes(chunk: Buffer | string): Buffer {
	return Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
}

/**
 * One run as the registry holds it, live or completed.
 *
 * The same object starts in the live map and moves to the completed map when
 * the run reaches its terminal state; it is not copied.
 */
class RegistryRun implements RunEntry {
	readonly id: string;
	readonly name: string;
	readonly child: ChildProcess;
	readonly pid: number;
	readonly processGroupId: number;
	readonly completion: Promise<RunCompletion>;
	readonly sessionPath: string;
	readonly startedAt: string;
	readonly entryCountAtLaunch: number;
	readonly abortController = new AbortController();
	readonly signal: AbortSignal;
	readonly #stdoutTail: OutputTail;
	readonly #stderrTail: OutputTail;
	#result: RunCompletion | undefined;
	// Placeholder; the constructor attaches the real resolver synchronously
	// from the promise executor before the run is ever returned.
	#settle: (completion: RunCompletion) => void = () => {
		throw new Error("Completion resolver is not attached.");
	};

	constructor(
		input: RegisterRunInput,
		id: string,
		startedAt: string,
		tailBytes: number,
	) {
		this.id = id;
		this.name = input.name ?? id;
		this.child = input.child;
		this.pid = input.pid;
		// With a detached spawn (POSIX) the child is its own process-group
		// leader, so the group id is the pid: a signal to -pid takes down the
		// child and its descendants together.
		this.processGroupId = input.pid;
		this.sessionPath = input.sessionPath;
		this.startedAt = startedAt;
		this.entryCountAtLaunch = input.entryCountAtLaunch;
		this.signal = this.abortController.signal;

		// The promise the parent awaits instead of polling. The executor runs
		// synchronously, so the resolver is attached before the run is
		// returned to the caller.
		this.completion = new Promise<RunCompletion>((resolve) => {
			this.#settle = resolve;
		});

		this.#stdoutTail = new OutputTail(tailBytes);
		this.#stderrTail = new OutputTail(tailBytes);

		// Capture tails only when the child's stdio is piped. An "ignore"
		// stdio leaves both streams null and the tails stay empty.
		const stdout = this.child.stdout;
		if (stdout !== null) {
			stdout.on("data", (chunk: Buffer | string) => {
				this.#stdoutTail.push(asBytes(chunk));
			});
		}
		const stderr = this.child.stderr;
		if (stderr !== null) {
			stderr.on("data", (chunk: Buffer | string) => {
				this.#stderrTail.push(asBytes(chunk));
			});
		}
	}

	get stdoutTail(): string {
		return this.#stdoutTail.text;
	}

	get stderrTail(): string {
		return this.#stderrTail.text;
	}

	/** The settled completion result, once the run reached its terminal state. */
	get completionResult(): RunCompletion | undefined {
		return this.#result;
	}

	/**
	 * Settle the completion promise with the classified result and stop the
	 * watcher loop by aborting the controller.
	 *
	 * The first result wins: a run has one terminal state, so settling is
	 * idempotent.
	 */
	complete(completion: RunCompletion): void {
		if (this.#result !== undefined) return;
		this.#result = completion;
		this.#settle(completion);
		// A completed run's watcher loop is done: a watcher subscribed to the
		// signal stops. Stop (process-group kill) aborts the same controller,
		// so one signal covers both paths.
		this.abortController.abort(
			new Error(`Run ${this.id} reached terminal state ${completion.status}.`),
		);
	}
}

export class RunningRegistry {
	#live = new Map<string, RegistryRun>();
	#completed = new Map<string, RegistryRun>();
	readonly #tailBytes: number;
	readonly #generateId: (takenIds: ReadonlySet<string>) => string;
	readonly #now: () => string;

	constructor(options: RunningRegistryOptions = {}) {
		this.#tailBytes = options.tailBytes ?? DEFAULT_TAIL_BYTES;
		this.#generateId = options.generateId ?? generateShortId;
		this.#now = options.now ?? (() => new Date().toISOString());
	}

	/**
	 * Register one live run and return its entry.
	 *
	 * The entry holds the process handle and process group, the completion
	 * promise, the session file path, the start time and entry count at
	 * launch, the stdout/stderr tails (captured when the child's stdio is
	 * piped), and the abort controller that stops the watcher loop.
	 *
	 * @throws DuplicateRunIdError when the run id is already registered.
	 */
	register(input: RegisterRunInput): RunEntry {
		const takenIds = new Set<string>([
			...this.#live.keys(),
			...this.#completed.keys(),
		]);
		const id = input.id ?? this.#generateId(takenIds);
		if (takenIds.has(id)) {
			throw new DuplicateRunIdError(id);
		}
		const run = new RegistryRun(
			input,
			id,
			input.startedAt ?? this.#now(),
			this.#tailBytes,
		);
		this.#live.set(id, run);
		return run;
	}

	/**
	 * Find a run by exact id first, then by name.
	 *
	 * The id is the stable handle; the name is convenience. A name that
	 * matches more than one run is an error that names the ambiguity and
	 * points the caller at the ids.
	 *
	 * @throws RunNotFoundError when nothing matches.
	 * @throws AmbiguousRunNameError when a name matches more than one run.
	 */
	find(idOrName: string): RunEntry {
		const run = this.#find(idOrName);
		if (run === undefined) {
			throw new RunNotFoundError(idOrName);
		}
		return run;
	}

	/**
	 * Like {@link find}, but returns `undefined` instead of throwing
	 * RunNotFoundError. Still throws AmbiguousRunNameError: a match that
	 * cannot be disambiguated by the query is an error in either form.
	 */
	get(idOrName: string): RunEntry | undefined {
		return this.#find(idOrName);
	}

	/**
	 * Record a run's classified completion: move it from the live map to the
	 * completed map and settle its completion promise.
	 *
	 * A completed run can then be re-read and delivered more than once
	 * without appearing live. Recording is idempotent: a run has one terminal
	 * state, and the first result wins.
	 *
	 * @throws RunNotFoundError when nothing matches.
	 * @throws AmbiguousRunNameError when a name matches more than one run.
	 */
	markCompleted(idOrName: string, completion: RunCompletion): RunEntry {
		const run = this.#find(idOrName);
		if (run === undefined) {
			throw new RunNotFoundError(idOrName);
		}
		if (this.#live.delete(run.id)) {
			this.#completed.set(run.id, run);
			run.complete(completion);
		}
		return run;
	}

	/**
	 * Read a run's settled completion result synchronously, without awaiting
	 * its promise. `undefined` for a run that has not completed.
	 */
	getCompletion(id: string): RunCompletion | undefined {
		return (this.#live.get(id) ?? this.#completed.get(id))?.completionResult;
	}

	/**
	 * Whether a live run matches the id or name. A name matching more than
	 * one run counts as live.
	 */
	isLive(idOrName: string): boolean {
		if (this.#live.has(idOrName)) return true;
		for (const run of this.#live.values()) {
			if (run.name === idOrName) return true;
		}
		return false;
	}

	/** The live runs, in registration order. */
	listLive(): RunEntry[] {
		return [...this.#live.values()];
	}

	/** The completed runs, in completion order. */
	listCompleted(): RunEntry[] {
		return [...this.#completed.values()];
	}

	/** The number of live runs. */
	get liveSize(): number {
		return this.#live.size;
	}

	/** The number of completed runs. */
	get completedSize(): number {
		return this.#completed.size;
	}

	/** The total number of runs held (live plus completed). */
	get size(): number {
		return this.#live.size + this.#completed.size;
	}

	/**
	 * Drop every completed run from the registry and return how many were
	 * dropped. Live runs are untouched.
	 */
	clearCompleted(): number {
		const count = this.#completed.size;
		this.#completed.clear();
		return count;
	}

	/**
	 * The lookup: exact id first (the stable handle), then name (convenience).
	 * A name match is collected across both maps; more than one match is an
	 * ambiguity error naming the ids.
	 */
	#find(idOrName: string): RegistryRun | undefined {
		const byId = this.#live.get(idOrName) ?? this.#completed.get(idOrName);
		if (byId !== undefined) return byId;

		const matches: RegistryRun[] = [];
		for (const run of this.#live.values()) {
			if (run.name === idOrName) matches.push(run);
		}
		for (const run of this.#completed.values()) {
			if (run.name === idOrName) matches.push(run);
		}
		if (matches.length > 1) {
			throw new AmbiguousRunNameError(
				idOrName,
				matches.map((run) => run.id),
			);
		}
		return matches[0];
	}
}
