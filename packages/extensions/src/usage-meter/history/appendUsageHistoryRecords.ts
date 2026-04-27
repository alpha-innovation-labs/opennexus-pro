import { mkdir, appendFile } from "node:fs/promises";
import { getUsageHistoryDirPath } from "./getUsageHistoryDirPath.js";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { serializeUsageHistoryRecord } from "./serializeUsageHistoryRecord.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Appends usage history records to the JSONL history file.
 *
 * @param records Usage history records.
 * @param filePath Optional file path override.
 */
export async function appendUsageHistoryRecords(records: UsageHistoryRecord[], filePath = getUsageHistoryFilePath()): Promise<void> {
  if (records.length === 0) return;
  await mkdir(getUsageHistoryDirPath(), { recursive: true });
  await appendFile(filePath, records.map(serializeUsageHistoryRecord).join(""), "utf8");
}
