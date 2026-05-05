import type { SmartEvalResult } from "../types.js";
import { smartEvalResultsByTimestamp } from "./smartEvalStore.js";

/**
 * Reads one smart-eval result by assistant message timestamp.
 *
 * @param assistantTimestamp Assistant message timestamp.
 * @returns Stored result when present.
 */
export function getSmartEvalResult(assistantTimestamp: number): SmartEvalResult | undefined {
	return smartEvalResultsByTimestamp.get(assistantTimestamp);
}
