import { SMART_EVAL_QUESTIONS } from "../prompt/buildSmartEvalPrompt.js";
import type { SmartEvalResult, SmartEvalTurn } from "../types.js";

/**
 * Creates a persisted placeholder result before background eval generation starts.
 *
 * @param turn Historical turn queued for evaluation.
 * @returns Pending eval result that prevents duplicate prep on resume.
 */
export function createPendingSmartEvalResult(turn: SmartEvalTurn): SmartEvalResult {
	return {
		assistantTimestamp: turn.assistantTimestamp,
		turnId: turn.turnId,
		status: "pending",
		questions: SMART_EVAL_QUESTIONS.map((question) => ({
			question,
			passed: false,
			explanation: "Eval generation is pending.",
		})),
	};
}
