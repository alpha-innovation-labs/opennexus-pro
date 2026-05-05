import { SMART_EVAL_QUESTIONS } from "../prompt/buildSmartEvalPrompt.js";
import type { SmartEvalResult, SmartEvalTurn } from "../types.js";

/**
 * Creates a persisted smart-eval result when generation fails, so the same turn is not retried on every resume.
 *
 * @param turn Historical turn whose eval could not be generated.
 * @returns Failed eval result with explanations.
 */
export function createFailedSmartEvalResult(turn: SmartEvalTurn): SmartEvalResult {
	return {
		assistantTimestamp: turn.assistantTimestamp,
		turnId: turn.turnId,
		status: "failed",
		questions: SMART_EVAL_QUESTIONS.map((question) => ({
			question,
			passed: false,
			explanation: "Eval generation failed before a valid result was produced.",
		})),
	};
}
