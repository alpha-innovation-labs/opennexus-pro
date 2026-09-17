/**
 * Completion layer: detect a run's terminal status from three signals and classify it
 * from the same evidence.
 *
 * A run reaches one terminal status — completed, failed, or cancelled. Completion is
 * detected from three signals and then classified from the same signals, because the
 * status is a property of the evidence, not of the exit code alone. The three signals
 * are:
 *
 * - **Process exit.** The child's exit event is the primary signal; the watcher waits
 *   on it.
 * - **Exit sidecar.** The child's termination path writes a file next to the session
 *   file carrying the exit code, a reason, and token counts. The sidecar is how the
 *   parent reads intent the exit code alone does not carry.
 * - **Session tail.** The entries appended to the session file since the run launched,
 *   from which the final assistant message is the summary.
 *
 * The sidecar reason is authoritative and overrides the exit code: pi exits zero even
 * when the model call failed after retries were exhausted, so a reason of `error`
 * marks the run failed regardless of the code, and the tail supplies the error
 * message. For auto-exit runs the watcher also reaps an idle run once its last
 * assistant message is stable for a grace period with no new entries.
 *
 * Target: context/extension/subagents/completion.md.
 */

import type { RunCompletion } from "../running";

/**
 * The reason the child's termination path records in the exit sidecar.
 *
 * This is the discriminator the raw exit code does not carry. `done` is the child's
 * clean self-termination (the `done` tool); `error` marks a failed run regardless of
 * the exit code; `cancelled` records that the run ended on request.
 */
export type SidecarReason = "done" | "error" | "cancelled";

/**
 * Token counts the child's termination path reports in the sidecar.
 */
export interface SidecarTokenUsage {
	/** Input (prompt) tokens. */
	readonly inputTokens?: number;
	/** Output (completion) tokens. */
	readonly outputTokens?: number;
	/** Total tokens. */
	readonly totalTokens?: number;
}

/**
 * The exit sidecar the child's termination path writes next to the session file.
 *
 * It carries the exit code, a reason, and token counts — the intent the exit code
 * alone does not carry. The parent reads it as the discriminator in classification.
 */
export interface ExitSidecar {
	/** Schema version. */
	readonly version: 1;
	/** The child's own exit code, when it exited on its own (absent/null when signalled). */
	readonly exitCode?: number | null;
	/** The signal that ended the child, when signalled (e.g. "SIGTERM"). */
	readonly signal?: string | null;
	/** The reason: the discriminator the exit code alone does not carry. */
	readonly reason: SidecarReason;
	/** Human-readable detail (the error message, a note, etc.). */
	readonly message?: string;
	/** Token counts reported by the child. */
	readonly usage?: SidecarTokenUsage;
}

/**
 * The final assistant message extracted from the session tail — the run's summary.
 *
 * "The final assistant message" is the last `message` entry in the tail whose role is
 * `assistant`. The tail is the entries appended since the run launched (everything
 * after `entryCountAtLaunch`), so an inherited branch is never treated as the run's
 * own output.
 */
export interface FinalAssistantMessage {
	/** The concatenated, trimmed text content of the assistant message. */
	readonly text: string;
	/** Whether the message carries real (non-empty) text content. */
	readonly hasRealText: boolean;
	/** The assistant message's stop reason, when present. */
	readonly stopReason?: string;
	/** The assistant message's error message, when present. */
	readonly errorMessage?: string;
	/** The session entry id the message came from. */
	readonly entryId: string;
	/** The session entry timestamp the message came from. */
	readonly timestamp: string;
}

/**
 * The evidence the completion layer gathers before classifying.
 *
 * These are the three signals (exit code, sidecar, tail) plus the two intent flags the
 * parent supplies (whether the run was stopped on request, and whether it is an
 * auto-exit run). The classification is a property of this evidence, not of the exit
 * code alone.
 */
export interface CompletionEvidence {
	/** The child's exit code, from the exit event (null when it ended on a signal). */
	readonly exitCode: number | null;
	/** The signal that ended the child, from the exit event (when signalled). */
	readonly signal?: string | null;
	/** The exit sidecar the child's termination path wrote, or null when absent. */
	readonly sidecar: ExitSidecar | null;
	/** The final assistant message from the session tail, or null when none exists. */
	readonly finalMessage: FinalAssistantMessage | null;
	/**
	 * True when the run was stopped on request (a parent kill, or an operator closing a
	 * manual run) rather than finishing on its own.
	 */
	readonly stoppedOnRequest: boolean;
	/** True when the run is a manual interactive run (as opposed to a background auto-exit run). */
	readonly interactive: boolean;
}

/**
 * Options that steer classification beyond the evidence alone.
 */
export interface ClassifyCompletionOptions {
	/** Supplies the current time as an ISO timestamp. Defaults to the system clock. */
	readonly now?: () => string;
}

/**
 * Stop reasons that mean the assistant message is a finished answer.
 *
 * `stop` is a natural completion and `length` a truncated-but-produced answer; both
 * carry a real final message when the text is non-empty.
 */
export const FINAL_ANSWER_STOP_REASONS: readonly string[] = ["stop", "length"];

/**
 * Stop reasons that mark the tail as having ended in a terminal error.
 *
 * These are the "terminal stop reasons": the last assistant message carries them when
 * the model call failed (retries exhausted) or was aborted, which the raw exit code
 * does not report (pi can exit zero).
 */
export const TERMINAL_ERROR_STOP_REASONS: readonly string[] = [
	"error",
	"aborted",
];

/**
 * Options that configure a completion watcher.
 */
export interface CompletionWatcherOptions {
	/**
	 * True for a background auto-exit run (the default). Auto-exit runs get the
	 * stable-summary reaper, which ends the process group once the last assistant
	 * message is stable for the grace period. False for a manual interactive run, which
	 * the operator drives and no reaper ends.
	 */
	readonly autoExit?: boolean;
	/**
	 * Supplies the current time as an ISO timestamp for `finishedAt`. Defaults to the
	 * system clock.
	 */
	readonly now?: () => string;
	/**
	 * Options for the stable-summary reaper. Applies to auto-exit runs only.
	 */
	readonly reaper?: StableSummaryReaperOptions;
}

/**
 * Options for the stable-summary reaper.
 */
export interface StableSummaryReaperOptions {
	/**
	 * Milliseconds the last assistant message must stay stable (unchanged text and no
	 * new entries) before the reaper ends the process group. Defaults to 2500.
	 */
	readonly graceMs?: number;
	/** Milliseconds between tail re-reads while the process is alive. Defaults to 250. */
	readonly pollMs?: number;
	/**
	 * The signal sent to the process group when the reaper ends it. Defaults to
	 * "SIGTERM".
	 */
	readonly signal?: NodeJS.Signals;
}

/**
 * The handle returned by the completion watcher.
 */
export interface CompletionWatcherHandle {
	/** The run id the watcher drives to completion. */
	readonly runId: string;
	/** The promise that resolves when the run reaches its terminal state. */
	readonly completion: Promise<RunCompletion>;
	/**
	 * Record that the run was stopped on request and end the process group. Idempotent.
	 * The run is then classified cancelled (or completed if it had already produced a
	 * real answer).
	 */
	readonly stop: (reason?: string) => void;
	/** Stop the watcher's loops (reaper) without ending the run. */
	readonly dispose: () => void;
}
