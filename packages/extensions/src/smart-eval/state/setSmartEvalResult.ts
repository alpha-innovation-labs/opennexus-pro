import type { SmartEvalResult } from "../types.js";
import { smartEvalResultsByTimestamp } from "./smartEvalStore.js";

/**
 * Stores one smart-eval result by assistant message timestamp.
 *
 * @param result Result to store.
 */
export function setSmartEvalResult(result: SmartEvalResult): void {
	smartEvalResultsByTimestamp.set(result.assistantTimestamp, result);
}
