import { compactUsageHistoryRecords } from "./compactUsageHistoryRecords.js";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { readUsageHistoryRecords } from "./readUsageHistoryRecords.js";
import { writeUsageHistoryRecords } from "./writeUsageHistoryRecords.js";

/**
 * Compacts the usage history file when any series exceeds the point limit.
 *
 * @param filePath Optional file path override.
 */
export async function compactUsageHistoryFile(filePath = getUsageHistoryFilePath()): Promise<void> {
  const records = await readUsageHistoryRecords(filePath, Number.MAX_SAFE_INTEGER);
  const compactedRecords = compactUsageHistoryRecords(records);
  if (compactedRecords.length === records.length) return;
  await writeUsageHistoryRecords(compactedRecords, filePath);
}
