import type { RunCompletion } from "../running";
import {
	type ClassifyCompletionOptions,
	type CompletionEvidence,
	FINAL_ANSWER_STOP_REASONS,
	type FinalAssistantMessage,
	TERMINAL_ERROR_STOP_REASONS,
} from "./types";

/**
 * Classification of a run's terminal status from the three signals.
 *
 * The status is a property of the evidence, not of the exit code alone:
 *
 * - The sidecar reason is authoritative and **overrides the exit code** — a reason of
 *   `error` marks the run failed regardless of the code, and the tail supplies the
 *   error message.
 * - The tail is the fallback discriminator: a tail that ends in a terminal stop reason
 *   marks the run failed, and a real final message marks it completed.
 * - The exit code is the last resort, and only in the "no real output" case does a
 *   non-zero (or signalled) exit mark a failure.
 *
 * A run stopped on request is cancelled — unless it had already produced a real final
 * message, in which case a close after a real answer is a successful close, not a
 * crash, and it is completed. This covers a manual interactive run the operator closes
 * by hand.
 *
 * Target: context/extension/subagents/completion.md (classification).
 */

/**
 * Whether the final assistant message is a real, finished answer.
 *
 * Real means it carries non-empty text, and finished means its stop reason is a
 * final-answer reason (or unknown) — not a tool-call, pending, or terminal-error
 * reason. This is the "produced a real final message" check.
 */
export function isRealFinalMessage(
	message: FinalAssistantMessage | null,
): boolean {
	if (message === null || !message.hasRealText) return false;
	if (message.stopReason === undefined) return true;
	return FINAL_ANSWER_STOP_REASONS.includes(message.stopReason);
}

/**
 * Whether the tail ended in a terminal stop reason — the last assistant message
 * carries an error/aborted stop reason. This is the "the model call failed after
 * retries" case the raw exit code does not report.
 */
function tailEndsInTerminalError(
	message: FinalAssistantMessage | null,
): boolean {
	if (message === null || message.stopReason === undefined) return false;
	return TERMINAL_ERROR_STOP_REASONS.includes(message.stopReason);
}

/**
 * A detail string when it has content, otherwise nothing (detail is optional).
 */
function detail(value: string | undefined): { detail: string } | undefined {
	const trimmed = value?.trim();
	return trimmed && trimmed.length > 0 ? { detail: trimmed } : undefined;
}

/**
 * Classify a run's terminal status from the three signals plus the stop intent.
 *
 * @param evidence The gathered evidence (exit code, sidecar, tail, stop intent).
 * @param options Optional overrides (the clock).
 * @returns The classified completion the registry's completion promise settles with.
 */
export function classifyCompletion(
	evidence: CompletionEvidence,
	options: ClassifyCompletionOptions = {},
): RunCompletion {
	const now = options.now ?? (() => new Date().toISOString());
	const finishedAt = now();
	const { exitCode, sidecar, finalMessage } = evidence;
	const realFinal = isRealFinalMessage(finalMessage);

	// The run was stopped on request (a parent kill, or an operator closing a manual
	// run). A close after a real answer is a successful close, not a crash; a stop
	// before any real answer is cancelled.
	if (evidence.stoppedOnRequest) {
		if (realFinal) {
			return {
				status: "completed",
				finishedAt,
				...(exitCode !== null ? { exitCode } : {}),
				...detail(
					sidecar?.message ?? "Stopped on request after a real answer.",
				),
			};
		}
		return {
			status: "cancelled",
			finishedAt,
			...(exitCode !== null ? { exitCode } : {}),
			...detail(
				sidecar?.message ?? "Stopped on request before a final answer.",
			),
		};
	}

	// The sidecar reason is authoritative and overrides the exit code.
	if (sidecar !== null) {
		switch (sidecar.reason) {
			case "error":
				return {
					status: "failed",
					finishedAt,
					...(exitCode !== null ? { exitCode } : {}),
					...detail(
						sidecar.message ??
							finalMessage?.errorMessage ??
							`Exit sidecar marked an error (exit code ${exitCode ?? "unknown"}).`,
					),
				};
			case "cancelled":
				return {
					status: "cancelled",
					finishedAt,
					...(exitCode !== null ? { exitCode } : {}),
					...detail(
						sidecar.message ?? "Exit sidecar marked the run cancelled.",
					),
				};
			// "done" — the only reason left after error and cancelled: a clean
			// self-termination, so a completed run. Kept as the default so a new
			// non-error reason cannot silently classify as a failure.
			default:
				return {
					status: "completed",
					finishedAt,
					...(exitCode !== null ? { exitCode } : {}),
					...detail(sidecar.message),
				};
		}
	}

	// No sidecar: the tail discriminates before the exit code does.
	if (tailEndsInTerminalError(finalMessage)) {
		return {
			status: "failed",
			finishedAt,
			...(exitCode !== null ? { exitCode } : {}),
			...detail(
				finalMessage?.errorMessage ??
					`Tail ended in a terminal stop reason (${finalMessage?.stopReason ?? "unknown"}).`,
			),
		};
	}
	if (realFinal) {
		return {
			status: "completed",
			finishedAt,
			...(exitCode !== null ? { exitCode } : {}),
		};
	}
	if (exitCode === 0) {
		return {
			status: "failed",
			finishedAt,
			exitCode,
			detail:
				"Exit code 0, but the run produced no real final message and no exit sidecar.",
		};
	}

	// Non-zero (or signalled) exit with no real output and no sidecar: failed.
	return {
		status: "failed",
		finishedAt,
		...(exitCode !== null ? { exitCode } : {}),
		...detail(
			`The run ended ${
				exitCode !== null
					? `with exit code ${exitCode}`
					: `on signal ${evidence.signal ?? "unknown"}`
			} without producing a real final message.`,
		),
	};
}
