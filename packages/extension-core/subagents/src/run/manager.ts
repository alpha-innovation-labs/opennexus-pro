import {
	type CompletionWatcherHandle,
	createCompletionWatcher,
	readRunTail,
} from "../completion";
import {
	attachResultDelivery,
	awaitRunResult,
	type RunResult,
} from "../delivery";
import { spawnSubagent } from "../launch";
import {
	resumeSubagentRun,
	signalProcessGroup,
	stopSubagentRun,
} from "../lifecycle";
import { compileAgentProfile } from "../profile";
import { type RunEntry, RunningRegistry } from "../running";
import {
	type SessionMode,
	SUBAGENT_LAUNCH_CUSTOM_TYPE,
	type SubagentLaunchConfig,
	seedSubagentSession,
} from "../session";
import type {
	KillOutcome,
	LaunchOutcome,
	LaunchRequest,
	ResumeOutcome,
	RunManagerSurface,
} from "./types";

/**
 * Run-orchestration layer: the parent-side composition root.
 *
 * The run manager holds the running registry (the in-memory handle index) and the
 * parent's steer/entry surface, and it drives the loop a run moves through:
 * launch -> run -> complete -> deliver, with stop and resume controlling the
 * lifecycle. Each method composes the landed layers (session seeding, profile
 * compilation, process launch, running registry, completion watcher, steer delivery,
 * and stop/resume) into one operation the tool surface calls.
 *
 * Target: context/extension/subagents/tool-surface.md.
 */

/**
 * The context a run is launched into: the parent's session file (for lineage/fork
 * seeding and the launch record) and the current working directory.
 */
export interface RunContext {
	readonly parentSession?: string;
	readonly cwd?: string;
}

/**
 * The parent-side run manager.
 *
 * A single instance is created per parent session and shared by the launch, resume,
 * and kill tools, so all three operate on the same registry and the same per-run
 * completion watchers.
 */
export class RunManager {
	readonly #registry: RunningRegistry;
	readonly #surface: RunManagerSurface;
	readonly #childExtension: string;
	readonly #sessionDir: string;
	readonly #cwd?: string;
	readonly #watchers = new Map<string, CompletionWatcherHandle>();

	constructor(options: {
		readonly registry: RunningRegistry;
		readonly surface: RunManagerSurface;
		readonly childExtension: string;
		readonly sessionDir: string;
		readonly cwd?: string;
	}) {
		this.#registry = options.registry;
		this.#surface = options.surface;
		this.#childExtension = options.childExtension;
		this.#sessionDir = options.sessionDir;
		this.#cwd = options.cwd;
	}

	/** The run registry this manager drives. */
	get registry(): RunningRegistry {
		return this.#registry;
	}

	/**
	 * Launch one or more runs in a single call so all of them start before any
	 * waiting begins.
	 *
	 * Phase 1 seeds, spawns, registers, watches, and wires delivery for every request
	 * (no awaiting). Phase 2 awaits only the blocking runs, which all already started.
	 * Async runs are returned immediately; their result is pushed to the parent by the
	 * watcher as a steer message when it settles.
	 */
	async launch(
		requests: readonly LaunchRequest[],
		ctx: RunContext = {},
	): Promise<LaunchOutcome[]> {
		const outcomes: LaunchOutcome[] = [];
		const blocking: { index: number; result: Promise<RunResult> }[] = [];

		// Phase 1: start every run (no awaiting), so a multi-launch starts them all
		// before any blocking run holds the turn.
		for (const request of requests) {
			const { run, mode } = this.#startRun(request, ctx);
			const delivery: "async" | "blocking" = request.blocking
				? "blocking"
				: "async";
			// Wire the watcher's settlement into the delivery machinery (a no-op for a
			// blocking run: the launch awaits and returns the result inline).
			attachResultDelivery(this.#surface, run, {
				blocking: delivery === "blocking",
			});
			const index = outcomes.length;
			outcomes.push({
				runId: run.id,
				name: run.name,
				...(request.title !== undefined ? { title: request.title } : {}),
				sessionPath: run.sessionPath,
				mode,
				delivery,
				...(delivery === "async" ? { started: true as const } : {}),
			});
			if (delivery === "blocking") {
				blocking.push({
					index,
					result: awaitRunResult(run).catch((error) =>
						this.#failureResult(run, error),
					),
				});
			}
		}

		// Phase 2: await the blocking runs (they all already started).
		for (const { index, result } of blocking) {
			const value = await result;
			outcomes[index] = { ...outcomes[index], result: value };
		}

		return outcomes;
	}

	/**
	 * Resume: re-spawn an ended or paused run from its session file and register the
	 * fresh run.
	 *
	 * The original run's process is gone (it completed), so the registry entry is not
	 * reused; the fresh run is registered under a new id carrying the original name.
	 * The launch configuration is resolved by the lifecycle layer (the child's own
	 * launch entry, then the parent's, then the supplied mode). The fresh run starts
	 * async and its result is pushed by the watcher on settlement.
	 */
	async resume(
		idOrName: string,
		options: {
			readonly mode?: SessionMode;
			readonly resumeTask?: string;
		} = {},
		ctx: RunContext = {},
	): Promise<ResumeOutcome> {
		const original = this.#registry.find(idOrName);

		const resumed = await resumeSubagentRun(original.sessionPath, {
			childExtension: this.#childExtension,
			metadata: {
				sessionId: original.id,
				...(ctx.parentSession !== undefined
					? { parentSession: ctx.parentSession }
					: {}),
				...(options.mode !== undefined ? { mode: options.mode } : {}),
			},
			...(options.resumeTask !== undefined
				? { resumeTask: options.resumeTask }
				: {}),
		});

		// The fresh run reads the current (grown) session file, so its baseline is the
		// file's current non-header entry count, not the original launch's.
		const entryCountAtLaunch = readRunTail(
			original.sessionPath,
			0,
		).nonHeaderCount;
		const run = this.#registry.register({
			child: resumed.child,
			pid: resumed.pid,
			sessionPath: original.sessionPath,
			entryCountAtLaunch,
			name: original.name,
		});
		const watcher = createCompletionWatcher(this.#registry, run, {
			autoExit: true,
		});
		this.#watchers.set(run.id, watcher);
		attachResultDelivery(this.#surface, run, { blocking: false });

		return {
			runId: run.id,
			name: run.name,
			sessionPath: run.sessionPath,
			source: resumed.launch.source,
			started: true,
		};
	}

	/**
	 * Kill: stop a live (or completed) run. The stop funnels into the completion
	 * machinery: the watcher is aborted, the run is marked stopped, the process group
	 * is signalled, and the watcher's exit handler classifies the terminal state and
	 * settles the run's completion promise (which the delivery machinery delivers).
	 */
	async kill(idOrName: string, reason?: string): Promise<KillOutcome> {
		const run = this.#registry.find(idOrName);
		const watcher = this.#watchers.get(run.id);
		const result = await stopSubagentRun(run, {
			...(reason !== undefined ? { reason } : {}),
			...(watcher !== undefined ? { watcher } : {}),
		});
		return {
			runId: run.id,
			name: run.name,
			stopped: result.watcherAborted,
			group: result.group,
			note:
				"Stopped. The run's watcher is aborted and the process group is signalled; " +
				"the watcher's exit handler classifies the terminal state and settles the " +
				"run's completion, which the delivery machinery pushes to the parent.",
		};
	}

	/**
	 * Stop every watcher this manager has created and kill every live process group.
	 * Called on parent shutdown so a parent exit never orphans a child process group.
	 */
	dispose(): void {
		for (const watcher of this.#watchers.values()) {
			watcher.stop("parent shutdown");
		}
		this.#watchers.clear();
		for (const run of this.#registry.listLive()) {
			signalProcessGroup(run.pid, "SIGKILL");
		}
	}

	/**
	 * Seed, spawn, register, and watch a single run. The completion watcher is created
	 * (and stored) but delivery is not attached here; the caller wires delivery and,
	 * for blocking runs, awaits the result.
	 */
	#startRun(
		request: LaunchRequest,
		ctx: RunContext,
	): { run: RunEntry; mode: SessionMode } {
		const surface = this.#surface;
		const childExtension = this.#childExtension;
		const sessionDir = this.#sessionDir;
		const registry = this.#registry;
		const mode = request.mode ?? "standalone";
		const parentSession = mode === "standalone" ? undefined : ctx.parentSession;
		if (parentSession === undefined) {
			throw new Error(
				`Session mode "${mode}" requires the parent session file to be available.`,
			);
		}

		const profile = request.agent;
		const compiled = profile
			? compileAgentProfile(profile)
			: { argv: [], env: {}, cwd: undefined };
		const cwd =
			request.cwd ?? compiled.cwd ?? ctx.cwd ?? this.#cwd ?? process.cwd();

		// The durable launch configuration, recorded verbatim for a faithful resume.
		const config: SubagentLaunchConfig = {
			...(profile?.model !== undefined ? { model: profile.model } : {}),
			...(profile?.thinking !== undefined
				? { thinking: profile.thinking }
				: {}),
			...(profile?.tools !== undefined ? { tools: [...profile.tools] } : {}),
			...(profile?.deny !== undefined
				? { deniedTools: [...profile.deny] }
				: {}),
			...(profile?.skills !== undefined ? { skills: [...profile.skills] } : {}),
			cwd,
			mode,
			flags: [...compiled.argv],
			...(profile?.env !== undefined ? { env: { ...profile.env } } : {}),
		};

		// Seed the child's session file before spawn: a fresh file (standalone) or a
		// branch (lineage-only / fork) with the launch entry appended.
		const handle = seedSubagentSession({
			config,
			sessionDir: sessionDir,
			...(parentSession !== undefined ? { parentSession } : {}),
		});

		// Spawn the child (writes the task artifact, builds the argv, spawns detached
		// and unref'd). The task artifact path is captured for the parent's launch record.
		const spawned = spawnSubagent({
			task: request.task,
			sessionPath: handle.path,
			...(profile !== undefined ? { profile } : {}),
			childExtension,
			artifactDir: sessionDir,
			cwd,
		});

		// Register the live run (the id is the registry's generated handle).
		const run = registry.register({
			child: spawned.child,
			pid: spawned.pid,
			sessionPath: handle.path,
			entryCountAtLaunch: handle.entryCountAtLaunch,
			...(request.name !== undefined ? { name: request.name } : {}),
		});

		// The watcher drives the completion promise and reaps idle async runs. A
		// blocking run needs no reaper (the parent holds the turn and awaits); an
		// async run is reaped when it goes idle so it never outlives a dead parent.
		const watcher = createCompletionWatcher(registry, run, {
			autoExit: !(request.blocking ?? false),
		});
		this.#watchers.set(run.id, watcher);

		// Record the launch in the parent's own session file: an inspectable transcript
		// entry and a resume metadata source (keyed by the child's session id).
		surface.appendEntry(SUBAGENT_LAUNCH_CUSTOM_TYPE, {
			version: 1,
			sessionId: run.id,
			...(request.title !== undefined ? { title: request.title } : {}),
			config: { ...config, taskArtifactPath: spawned.artifactPath },
		});

		return { run, mode };
	}

	/**
	 * Assemble a synthetic failure result so a blocking launch still returns (rather
	 * than rejecting) when the run's completion rejects (e.g. the watcher failed to
	 * register the completion and the process died).
	 */
	#failureResult(run: RunEntry, error: unknown): RunResult {
		const message = error instanceof Error ? error.message : String(error);
		return {
			runId: run.id,
			sessionPath: run.sessionPath,
			status: "failed",
			summary: `The run's completion could not be read: ${message}`,
			detail: message,
			finishedAt: new Date().toISOString(),
			name: run.name,
		};
	}
}

/**
 * Create the parent-side run manager for a session.
 *
 * The registry is fresh per parent; the surface is the parent's `ExtensionAPI`; the
 * child extension and session directory are resolved by the caller.
 */
export function createRunManager(options: {
	readonly surface: RunManagerSurface;
	readonly childExtension: string;
	readonly sessionDir: string;
	readonly cwd?: string;
}): RunManager {
	return new RunManager({
		registry: new RunningRegistry(),
		surface: options.surface,
		childExtension: options.childExtension,
		sessionDir: options.sessionDir,
		...(options.cwd !== undefined ? { cwd: options.cwd } : {}),
	});
}
