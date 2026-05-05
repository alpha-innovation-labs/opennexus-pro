import type { SmartEvalResult } from "../types.js";

/**
 * Returns whether a smart-eval result is only a pending placeholder.
 *
 * @param result Evaluation result to inspect.
 * @returns True when the eval is still being generated.
 */
export function isSmartEvalPending(result: SmartEvalResult): boolean {
	return result.status === "pending";
}
