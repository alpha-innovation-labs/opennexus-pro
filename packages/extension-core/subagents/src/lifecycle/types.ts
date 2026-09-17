import type { ChildProcess, StdioOptions } from "node:child_process";
import type { SessionMode, SubagentLaunchConfig } from "../session";

/**
 * Stop/resume layer: lifecycle operations on a run, each on its own layer.
 *
 * A run can be stopped while running and resumed after it has ended. Stop
 * acts on the process group; resume acts on the session file. The two
 * operate on different layers, which is what keeps each one simple: stop
 * never has to reason about state and resume never has to reason about a
 * live process.
 *
 * - **Stop** aborts the run's watcher loop and sends a terminate signal to
 *   the child's whole process group (the negative pid), so the child and
 *   anything it spawned end together. An interactive run's terminal surface
 *   is closed as well. If the group does not die, a kill signal follows
 *   after a grace period. Stop requires the run to have been spawned
 *   detached: only a detached child is a process-group leader, and only a
 *   group leader can be signalled as a group.
 * - **Resume** re-spawns the same session file with the configuration the
 *   run was launched with. The conversation is already in the session file;
 *   the launch configuration is in the file's metadata entry. Resume reads
 *   the metadata, rebuilds the argv, and starts a fresh process pointed at
 *   the existing file. The metadata sources fall back in order: the child's
 *   own file, then the entries of the parent's session file that recorded
 *   the launch, then an explicitly requested mode.
 *
 * Target: context/extension/subagents/stop-resume.md.
 */

/**
 * The result of signalling a process group.
 */
export interface SignalProcessGroupResult {
	/** The signal that was sent. */
	readonly signal: NodeJS.Signals;
	/**
	 * True when the group was already gone (ESRCH), so the signal was a
	 * no-op: the goal — the group being gone — already held.
	 */
	readonly alreadyGone: boolean;
}

/**
 * Options for stopping a process group with a kill fallback.
 */
export interface StopProcessGroupOptions {
	/**
	 * The initial terminate signal sent to the group. Defaults to
	 * `"SIGTERM"`.
	 */
	readonly signal?: NodeJS.Signals;
	/**
	 * The escalation signal sent when the group survives the grace period.
	 * Defaults to `"SIGKILL"`.
	 */
	readonly escalateSignal?: NodeJS.Signals;
	/**
	 * Milliseconds the group is given to die after the initial signal before
	 * the escalation is sent. Defaults to 3000.
	 */
	readonly graceMs?: number;
	/**
	 * Milliseconds between liveness probes while waiting out the grace
	 * period. Defaults to 50.
	 */
	readonly pollMs?: number;
}

/**
 * The outcome of stopping a process group with a kill fallback.
 */
export interface StopProcessGroupResult {
	/** The initial signal sent to the group. */
	readonly signal: NodeJS.Signals;
	/** True when the group was already gone before the initial signal. */
	readonly alreadyGone: boolean;
	/**
	 * True when the group survived the grace period and the escalation
	 * signal was sent.
	 */
	readonly escalated: boolean;
	/**
	 * True when the group was still observable after the escalation and the
	 * short confirmation probe that follows it — a genuine anomaly, such as
	 * a process stuck in the kernel. False when the group had died within the
	 * grace period, or was already gone.
	 */
	readonly stillAlive: boolean;
}

/**
 * The terminal surface an interactive run owns.
 *
 * Stop closes it so an interactive run's terminal does not stay open on a
 * killed process group. The stop layer is agnostic to what the surface is:
 * it calls `close`.
 */
export interface TerminalSurface {
	/** Close the surface. Idempotent; errors are the surface's to report. */
	close: () => void;
}

/**
 * Options for stopping a registered run.
 */
export interface StopSubagentRunOptions {
	/**
	 * The stop reason. Carried into the run's completion detail so the
	 * classified result records what the stop was for.
	 */
	readonly reason?: string;
	/**
	 * The run's completion watcher handle. When given, its `stop(reason)` is
	 * called so the run is classified as a stop on request (cancelled, or
	 * completed when it had already produced a real answer) rather than a
	 * plain signalled exit.
	 */
	readonly watcher?: { readonly stop: (reason?: string) => void };
	/**
	 * The terminal surface of an interactive run. Closed after the process
	 * group has been stopped. Omitted for a background run.
	 */
	readonly terminalSurface?: TerminalSurface;
	/** Options for the process-group stop (signals, grace period). */
	readonly group?: StopProcessGroupOptions;
}

/**
 * The outcome of stopping a run.
 */
export interface StopSubagentRunResult {
	/** The run id that was stopped. */
	readonly runId: string;
	/**
	 * True when this stop is what aborted the run's abort controller (the
	 * watcher-loop stop signal). False when it was already aborted — for
	 * example because the run had already completed.
	 */
	readonly watcherAborted: boolean;
	/** The process-group stop outcome. */
	readonly group: StopProcessGroupResult;
	/** True when an interactive run's terminal surface was closed. */
	readonly terminalSurfaceClosed: boolean;
}

/**
 * Where a resume found the run's launch configuration.
 *
 * The sources are tried in order and the first that yields a config wins:
 * the child's own session file, then the parent's session file's entries
 * that recorded the launch, then an explicitly requested mode. The
 * persisted metadata is authoritative; the explicit mode is only a fallback
 * when no metadata can be found.
 */
export type ResumeMetadataSource =
	| "child-file"
	| "parent-entries"
	| "explicit-mode";

/**
 * The resolved launch configuration a resume builds from, and where it came
 * from.
 */
export interface ResumeLaunchConfig {
	/** The resolved launch configuration. */
	readonly config: SubagentLaunchConfig;
	/** The metadata source that supplied the configuration. */
	readonly source: ResumeMetadataSource;
}

/**
 * Options for resolving a run's launch configuration for a resume.
 */
export interface ResolveResumeLaunchConfigOptions {
	/**
	 * The explicitly requested mode. The last-resort fallback: used only
	 * when neither the child's own file nor the parent's entries carry
	 * launch metadata. Rebuilds a minimal configuration (working directory
	 * and mode) from the session file's header.
	 */
	readonly mode?: SessionMode;
	/**
	 * The child's session id, for matching the parent's launch entries to
	 * this run. When the child's own file is present it is read from the
	 * file's header; supply it to match when the file is missing.
	 */
	readonly sessionId?: string;
	/**
	 * The parent's session file path, for the second metadata source. When
	 * the child's own file is present it is read from the file's header
	 * (`parentSession`); supply it to read the parent directly when the
	 * child's file is missing.
	 */
	readonly parentSession?: string;
}

/**
 * The pieces that build the resumed child's pi-level argv.
 */
export interface BuildResumeArgvInput {
	/** The existing session file the resumed child is pointed at. */
	readonly sessionPath: string;
	/** Absolute path to the child-side pi extension loaded with `--extension`. */
	readonly childExtension: string;
	/**
	 * The resolved launch configuration. Its recorded flags are carried into
	 * the argv and its recorded task artifact is the artifact the argv
	 * references.
	 */
	readonly config: SubagentLaunchConfig;
	/**
	 * A resume prompt. Written to a fresh artifact file and referenced in the
	 * argv only when the launch configuration records no artifact path.
	 */
	readonly resumeTask?: string;
	/**
	 * Directory to write a resume task artifact in. Defaults to the session
	 * file's directory.
	 */
	readonly artifactDir?: string;
}

/**
 * The resumed child's pi-level argv plus the artifact it references.
 */
export interface BuiltResumeArgv {
	/** The pi-level argv for the resumed child. */
	readonly argv: string[];
	/** The artifact file the argv references, or `null` when it carries none. */
	readonly taskArtifactPath: string | null;
}

/**
 * Options for re-spawning a run's session file.
 */
export interface ResumeSubagentOptions {
	/** Where to look for the launch metadata (in order). */
	readonly metadata?: ResolveResumeLaunchConfigOptions;
	/**
	 * Absolute path to the child-side pi extension (loaded with
	 * `--extension`).
	 */
	readonly childExtension: string;
	/**
	 * A resume prompt text. Written to a fresh artifact and referenced in
	 * the argv only when the launch configuration records no artifact path.
	 */
	readonly resumeTask?: string;
	/** Directory to write a resume task artifact in. Defaults to the session file's directory. */
	readonly artifactDir?: string;
	/** Override the resolved pi command (for tests or a pinned pi). */
	readonly command?: string;
	/** Override the base arguments that select the pi entry (for tests or a pinned pi). */
	readonly baseArgs?: readonly string[];
	/** Child stdio for the spawned process. Defaults to `"ignore"`. */
	readonly stdio?: StdioOptions;
	/** Whether the resumed child is a process-group leader. Defaults to `true`. */
	readonly detached?: boolean;
}

/**
 * The handle returned by a resume: the fresh detached, unref'd child plus the
 * resolved launch metadata and every path and argument the run was started
 * with.
 */
export interface ResumedSubagent {
	/** The resolved launch configuration and the source it came from. */
	readonly launch: ResumeLaunchConfig;
	/** The executable that runs the pi entry. */
	readonly command: string;
	/** Arguments that select the pi entry (before the pi-level flags). */
	readonly baseArgs: string[];
	/** The pi-level child argv the resumed child was started with. */
	readonly argv: string[];
	/** The artifact file the argv references, or `null` when it carries none. */
	readonly taskArtifactPath: string | null;
	/** The detached, unref'd child process handle. The caller owns its exit/error events. */
	readonly child: ChildProcess;
	/** The child's pid. With a detached spawn (POSIX) this is also the process-group id. */
	readonly pid: number;
	/** The existing session file the child is pointed at (the durable record). */
	readonly sessionPath: string;
	/** The working directory the child runs in. */
	readonly cwd: string;
	/** The full environment the child was spawned with. */
	readonly env: Record<string, string>;
	/** ISO timestamp of when the resumed child was spawned. */
	readonly spawnedAt: string;
}
