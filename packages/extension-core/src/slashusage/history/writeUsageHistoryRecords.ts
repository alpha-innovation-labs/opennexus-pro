import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { serializeUsageHistoryRecord } from "./serializeUsageHistoryRecord.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Rewrites the usage history JSONL file with provided records.
 *
 * @param records Usage history records.
 * @param filePath Optional file path override.
 */
export async function writeUsageHistoryRecords(records: UsageHistoryRecord[], filePath = getUsageHistoryFilePath()): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, records.map(serializeUsageHistoryRecord).join(""), "utf8");
}
