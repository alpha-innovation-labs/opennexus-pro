import { join } from "node:path";
import { getUsageHistoryModelsDirPath } from "./getUsageHistoryModelsDirPath.js";
import { sanitizeUsageHistoryModelKey } from "./sanitizeUsageHistoryModelKey.js";

/**
 * Returns the per-model usage history JSONL file path.
 *
 * @param modelKey Provider-scoped model key.
 * @returns Absolute per-model history file path.
 */
export function getUsageHistoryModelFilePath(modelKey: string): string {
	return join(getUsageHistoryModelsDirPath(), `${sanitizeUsageHistoryModelKey(modelKey)}.jsonl`);
}
