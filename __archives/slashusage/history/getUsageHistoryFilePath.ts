import { join } from "node:path";
import { getUsageHistoryDirPath } from "./getUsageHistoryDirPath.js";

/**
 * Returns the append-only usage history JSONL file path.
 *
 * @returns Absolute usage history file path.
 */
export function getUsageHistoryFilePath(): string {
  return join(getUsageHistoryDirPath(), "usage-snapshots.jsonl");
}
