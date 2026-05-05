import type { SmartEvalResult } from "../types.js";

/**
 * Formats one smart-eval result as a numerator over total question count.
 *
 * @param result Evaluation result to score.
 * @returns Compact score label.
 */
export function getSmartEvalScore(result: SmartEvalResult): string {
	const passed = result.questions.filter((question) => question.passed).length;
	return `${passed}/${result.questions.length}`;
}
