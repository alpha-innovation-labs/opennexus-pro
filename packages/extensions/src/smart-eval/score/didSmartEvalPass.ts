import type { SmartEvalResult } from "../types.js";

/**
 * Returns whether every smart-eval question passed.
 *
 * @param result Evaluation result to inspect.
 * @returns True when all questions passed.
 */
export function didSmartEvalPass(result: SmartEvalResult): boolean {
	return result.questions.every((question) => question.passed);
}
