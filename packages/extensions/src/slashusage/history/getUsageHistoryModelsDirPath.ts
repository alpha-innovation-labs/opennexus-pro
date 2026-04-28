import { join } from "node:path";
import { getUsageHistoryDirPath } from "./getUsageHistoryDirPath.js";

/**
 * Returns the directory that stores one usage history file per model.
 *
 * @returns Absolute per-model history directory path.
 */
export function getUsageHistoryModelsDirPath(): string {
	return join(getUsageHistoryDirPath(), "models");
}
