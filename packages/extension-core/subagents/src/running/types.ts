import type { ChildProcess } from "node:child_process";

/**
 * Running-registry layer: the parent's in-memory index of live runs.
 *
 * The parent keeps an in-memory map of live runs, keyed by run id. The map is
 * the parent's fast path for the operations a turn performs by name: find it,
 * wait on it, stop it. It holds handles and short-lived data only. Durable
 * state lives in the session file.
 *
 * The registry is deliberately not durable. If it were the source of truth, a
 * parent restart would lose every live run and the watcher promises with it.
 * Keeping it a handle index means the parent can rebuild what it needs from the
 * session files, and a run's truth is never "whatever the parent process
 * happened to be holding." The split is what lets stop and resume operate on
 * files rather than on live memory.
 *
 * Target: context/extension/subagents/running-registry.md.
 */

/**
 * The terminal status of a run: completed, failed, or cancelled.
 *
 * The completion layer (detection and classification from the process exit,
 * the exit sidecar, and the session tail) produces the status; the registry
 * only carries it.
 */
export type RunCompletionStatus = "completed" | "failed" | "cancelled";

/**
 * The classified terminal outcome of a run.
 *
 * This is the value the registry's completion promise settles with, and what
 * a completed entry carries so a result can be re-read and delivered more than
 * once.
 */
export interface RunCompletion {
	/** The terminal status. */
	readonly status: RunCompletionStatus;
	/** ISO timestamp of when the run reached its terminal state. */
	readonly finishedAt: string;
	/** The child's exit code, present when the process exited. */
	readonly exitCode?: number;
	/** Human-readable detail for error reporting (the sidecar reason or a tail message). */
	readonly detail?: string;
}

/**
 * The inputs that register one run in the registry.
 *
 * Every field is a handle or short-lived data; the durable record is the run's
 * session file, which the caller has already seeded.
 */
export interface RegisterRunInput {
	/** The detached, unref'd child process handle. */
	readonly child: ChildProcess;
	/** The child's pid. With a detached spawn (POSIX) this is also the process-group id. */
	readonly pid: number;
	/** Absolute path to the run's session file (the durable record). */
	readonly sessionPath: string;
	/**
	 * Number of non-header session entries present at launch, so a later read
	 * knows which entries the run produced (everything after this count).
	 */
	readonly entryCountAtLaunch: number;
	/** The stable run id. Omit to have the registry generate one. */
	readonly id?: string;
	/** The display name for lookup by name. Defaults to the run id. */
	readonly name?: string;
	/** ISO timestamp of the run's start time. Defaults to the current time. */
	readonly startedAt?: string;
}

/**
 * Options that configure a registry.
 */
export interface RunningRegistryOptions {
	/**
	 * Maximum number of bytes kept in each stdout/stderr tail ("the last few
	 * kilobytes"). Defaults to 4096.
	 */
	readonly tailBytes?: number;
	/**
	 * Generates a run id when the input does not supply one. Receives the ids
	 * already taken so it can avoid collisions. Defaults to an 8-hex-char
	 * random id.
	 */
	readonly generateId?: (takenIds: ReadonlySet<string>) => string;
	/** Supplies the current time as an ISO timestamp. Defaults to the system clock. */
	readonly now?: () => string;
}

/**
 * A run as the registry holds it — a handle index, not the source of truth.
 *
 * The same entry object starts in the live map and moves to the completed map
 * when the run reaches its terminal state; it is not copied.
 */
export interface RunEntry {
	/** The stable run id — the stable handle. */
	readonly id: string;
	/** The display name (convenience; a name may match more than one run). */
	readonly name: string;
	/** The child process handle. */
	readonly child: ChildProcess;
	/** The child's pid. */
	readonly pid: number;
	/**
	 * The process-group id to signal for a group kill. Equals the pid for a
	 * detached spawn, where the child is its own group leader.
	 */
	readonly processGroupId: number;
	/**
	 * Settles with the classified completion when the run reaches its terminal
	 * state, so the parent can await the run without polling.
	 */
	readonly completion: Promise<RunCompletion>;
	/** Absolute path to the run's session file. */
	readonly sessionPath: string;
	/** ISO timestamp of the run's start time. */
	readonly startedAt: string;
	/** Number of non-header session entries at launch. */
	readonly entryCountAtLaunch: number;
	/** The last few kilobytes of the child's stdout, decoded as UTF-8. */
	readonly stdoutTail: string;
	/** The last few kilobytes of the child's stderr, decoded as UTF-8. */
	readonly stderrTail: string;
	/** The abort controller that stops the run's watcher loop. */
	readonly abortController: AbortController;
	/** The controller's signal, for a watcher loop to subscribe to. */
	readonly signal: AbortSignal;
}
