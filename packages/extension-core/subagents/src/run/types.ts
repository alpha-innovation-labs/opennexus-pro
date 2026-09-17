import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { RunResult } from "../delivery";
import type { AgentProfile } from "../profile";
import type { SessionMode } from "../session";

/**
 * Run-orchestration layer: the parent-side composition that turns a launch, resume,
 * or kill request into the layered operations the prior beads landed.
 *
 * The run manager is the parent's composition root. It holds the running registry
 * (the in-memory handle index) and the parent's steer/entry surface, and it drives the
 * loop a run moves through: launch -> run -> complete -> deliver, with stop and
 * resume controlling the lifecycle. Each method composes the landed layers (session
 * seeding, profile compilation, process launch, running registry, completion watcher,
 * steer delivery, and stop/resume) into one operation the tool surface calls.
 *
 * Target: context/extension/subagents/tool-surface.md (the parent tools).
 */

/**
 * How a launched run's result is delivered back to the parent.
 *
 * - `async` (the default): the run starts and the launch returns immediately; the
 *   result is pushed to the parent as a steer message when the run's watcher settles.
 * - `blocking`: the launch awaits the run's completion and returns the result inline,
 *   so the parent holds the answer in the same turn it launched the run.
 */
export type RunDeliveryMode = "async" | "blocking";

/**
 * One run request as the launch tool accepts it.
 *
 * A single run is launched with a task (and optionally an agent profile, name, and
 * title); multiple runs for one request are launched in a single call so all of them
 * start before any waiting begins.
 */
export interface LaunchRequest {
	/** The task text. Required and non-empty: the child always has a prompt. */
	readonly task: string;
	/** The display name for lookup by name. Defaults to the run id. */
	readonly name?: string;
	/** A human-readable title for the run. */
	readonly title?: string;
	/** The agent profile compiled into the child invocation (argv and environment). */
	readonly agent?: AgentProfile;
	/** The session mode the run's file is seeded in. Defaults to `"standalone"`. */
	readonly mode?: SessionMode;
	/** True for a blocking (sync) run: the launch awaits the run and returns the result inline. */
	readonly blocking?: boolean;
	/** Working directory override. Defaults to the profile `cwd`, then the current cwd. */
	readonly cwd?: string;
}

/**
 * The per-run outcome returned by a launch.
 *
 * An async run reports that it started; its result arrives later as a steer message.
 * A blocking run carries its result inline, assembled from the awaited completion.
 */
export interface LaunchOutcome {
	/** The stable run id. */
	readonly runId: string;
	/** The display name. */
	readonly name: string;
	/** The title, when one was supplied. */
	readonly title?: string;
	/** Absolute path to the run's session file (the durable record). */
	readonly sessionPath: string;
	/** The session mode the run's file was seeded in. */
	readonly mode: SessionMode;
	/** How the run's result is delivered. */
	readonly delivery: RunDeliveryMode;
	/** Present for an async run: it started and the result arrives by steer. */
	readonly started?: true;
	/** Present for a blocking run: the awaited, inline result. */
	readonly result?: RunResult;
}

/**
 * The per-run outcome returned by a resume.
 */
export interface ResumeOutcome {
	/** The stable id of the resumed (fresh) run. */
	readonly runId: string;
	/** The display name (carried over from the resumed run). */
	readonly name: string;
	/** Absolute path to the run's session file (the durable record, re-spawned). */
	readonly sessionPath: string;
	/** The metadata source the launch configuration was resolved from. */
	readonly source: "child-file" | "parent-entries" | "explicit-mode";
	/** The resumed run started; its result arrives by steer (async). */
	readonly started: true;
}

/**
 * The per-run outcome returned by a kill.
 */
export interface KillOutcome {
	/** The id of the run that was stopped. */
	readonly runId: string;
	/** The display name of the run that was stopped. */
	readonly name: string;
	/**
	 * True when this stop aborted the run's watcher loop (false when the run had
	 * already completed and the controller was already aborted).
	 */
	readonly stopped: boolean;
	/** The process-group stop outcome (the signals sent and whether the group is gone). */
	readonly group: {
		readonly signal: NodeJS.Signals;
		readonly alreadyGone: boolean;
		readonly escalated: boolean;
		readonly stillAlive: boolean;
	};
	/** A note on how the run's terminal state is classified (both stop paths funnel into completion). */
	readonly note: string;
}

/**
 * The parent's steer/entry surface the run manager needs.
 *
 * `sendMessage` is the steer delivery (the async result push the delivery layer makes);
 * `appendEntry` is the durable launch record in the parent's own session file (a
 * transcript entry a reader can see, and a resume metadata source). Typed as a `Pick`
 * of the real `ExtensionAPI` so a full `ExtensionAPI` is directly assignable and a test
 * stub only implements these two.
 */
export type RunManagerSurface = Pick<
	ExtensionAPI,
	"sendMessage" | "appendEntry"
>;
