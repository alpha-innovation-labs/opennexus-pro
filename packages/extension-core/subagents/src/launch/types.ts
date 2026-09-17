import type { ChildProcess, StdioOptions } from "node:child_process";
import type { AgentProfile } from "../profile";

/**
 * Process-launch layer: spawn the child run as a separate OS process.
 *
 * A subagent run is a separate operating-system process, not an in-process call.
 * The parent extension resolves the pi invocation, builds the child argv, writes
 * the task to an artifact file, and spawns a headless pi process pointed at the
 * child's own session file. The spawn carries the three properties the rest of the
 * system depends on:
 *
 * - **Headless.** The child runs the one-shot prompt form, no TUI. It runs the task
 *   and exits.
 * - **Detached.** The child starts as its own process-group leader, so a group signal
 *   takes down the child and anything it spawned.
 * - **Unref'd.** The parent does not keep the process table open for the child, so it
 *   can exit freely while a detached child keeps running.
 *
 * Target: context/extension/subagents/process-launch.md.
 */

/**
 * The resolved pi invocation: the executable that runs the pi entry, plus the
 * arguments that select the entry. An empty `baseArgs` means the executable is the
 * pi binary itself (for example a bundled binary with no separate entry script).
 */
export interface PiInvocation {
	/** The executable to run (node, bun, or a pi binary). */
	readonly command: string;
	/** Arguments that select the pi entry (e.g. `[cli.js]`); empty for a bundled binary. */
	readonly baseArgs: string[];
}

/**
 * The pieces that build the child's pi-level argv.
 *
 * The child argv is the headless prompt form plus a session argument, the mandatory
 * child-side extension, and the profile-derived flags. The task is carried by an
 * artifact-file reference (a `@<path>`), not inlined, so a long prompt never hits
 * argument-length limits or shell-quoting edge cases.
 */
export interface BuildChildArgvInput {
	/** The run's session file path (the durable record the child is pointed at). */
	readonly sessionPath: string;
	/** Absolute path to the child-side pi extension loaded with `--extension`. */
	readonly childExtension: string;
	/** Absolute path to the task artifact file. The layer prefixes `@` to reference it. */
	readonly taskArtifactPath: string;
	/** Profile-derived flags (from `compileAgentProfile`). May be empty. */
	readonly profileFlags: readonly string[];
}

/**
 * Options that control how the child process is spawned.
 */
export interface SpawnChildProcessOptions {
	/** The executable to run. */
	readonly command: string;
	/** All arguments to the executable (entry selection plus the pi-level flags). */
	readonly args: string[];
	/** The full environment for the child (replaces the parent env, so include it). */
	readonly env: Record<string, string>;
	/** The working directory to spawn in. */
	readonly cwd: string;
	/** Child stdio. Defaults to `"ignore"` (unattended). Set `"pipe"` to capture tails. */
	readonly stdio?: StdioOptions;
	/**
	 * Make the child a process-group leader. Must be `true` for a group kill to work;
	 * defaults to `true`.
	 */
	readonly detached?: boolean;
}

/**
 * The detached, unref'd child process plus the launch metadata a run owns.
 */
export interface SpawnedChildProcess {
	/** The detached, unref'd child process handle. */
	readonly child: ChildProcess;
	/** The child's pid. With a detached spawn (POSIX) this is also the process-group id. */
	readonly pid: number;
}

/**
 * Options for composing the full launch of one subagent run.
 */
export interface SpawnSubagentOptions {
	/**
	 * The task text. Written to an artifact file and passed to the child by reference.
	 * Required to be non-empty so the child always has a prompt.
	 */
	readonly task: string;
	/** The run's session file path (already seeded). The child is pointed at this file. */
	readonly sessionPath: string;
	/** The agent profile compiled into the child argv and environment. May be omitted. */
	readonly profile?: AgentProfile;
	/** Absolute path to the child-side pi extension (loaded with `--extension`). */
	readonly childExtension: string;
	/** Directory to write the task artifact in. Defaults to the session file's directory. */
	readonly artifactDir?: string;
	/** A stable name fragment for the task artifact file. Defaults to a short random id. */
	readonly artifactName?: string;
	/** Environment merged over the parent env and the profile env (highest precedence). */
	readonly env?: Readonly<Record<string, string>>;
	/** Working directory override. Defaults to the profile `cwd`, then the current cwd. */
	readonly cwd?: string;
	/** Override the resolved pi command (for tests or a pinned pi). */
	readonly command?: string;
	/** Override the base arguments that select the pi entry (for tests or a pinned pi). */
	readonly baseArgs?: readonly string[];
	/** Child stdio for the spawned process. Defaults to `"ignore"`. */
	readonly stdio?: StdioOptions;
	/** Whether the child is a process-group leader. Defaults to `true`. */
	readonly detached?: boolean;
}

/**
 * The handle returned by `spawnSubagent`: the detached, unref'd child plus every
 * path and argument a later layer (running registry, completion, stop/resume) needs.
 */
export interface SpawnedSubagent {
	/** The detached, unref'd child process handle. The caller owns its exit/error events. */
	readonly child: ChildProcess;
	/** The child's pid. With a detached spawn (POSIX) this is also the process-group id. */
	readonly pid: number;
	/** Absolute path to the run's session file (the durable record). */
	readonly sessionPath: string;
	/** Absolute path to the task artifact file the child was pointed at. */
	readonly artifactPath: string;
	/** Absolute path of the child-side extension loaded with `--extension`. */
	readonly childExtension: string;
	/** The executable that runs the pi entry. */
	readonly command: string;
	/** Arguments that select the pi entry (before the pi-level flags). */
	readonly baseArgs: string[];
	/** The pi-level child argv (headless form, session, extension, profile flags, task ref). */
	readonly argv: string[];
	/** The full environment the child was spawned with (parent env + profile + overrides). */
	readonly env: Record<string, string>;
	/** The working directory the child runs in. */
	readonly cwd: string;
	/** ISO timestamp of when the child was spawned. */
	readonly spawnedAt: string;
}
