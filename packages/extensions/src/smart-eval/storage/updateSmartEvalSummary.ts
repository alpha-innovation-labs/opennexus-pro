import { getSmartEvalScore } from "../score/getSmartEvalScore.js";
import type { SmartEvalState } from "../types.js";

/**
 * Updates the aggregate summary for persisted smart-eval state.
 *
 * @param state Smart-eval state to update.
 */
export function updateSmartEvalSummary(state: SmartEvalState): void {
	if (state.turns.length === 0) {
		state.summary = "No evaluated turns yet.";
		return;
	}
	const passedQuestions = state.turns.reduce((total, turn) => total + turn.result.questions.filter((question) => question.passed).length, 0);
	const totalQuestions = state.turns.reduce((total, turn) => total + turn.result.questions.length, 0);
	state.summary = `${state.turns.length} evaluated turn(s), ${passedQuestions}/${totalQuestions} checks passed. Latest: ${getSmartEvalScore(state.turns.at(-1)!.result)}.`;
}
