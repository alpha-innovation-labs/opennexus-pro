import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { compactUsageHistoryFile } from "./compactUsageHistoryFile.js";
import { serializeUsageHistoryRecord } from "./serializeUsageHistoryRecord.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Appends records to one JSONL file and compacts it.
 *
 * @param records Usage history records.
 * @param filePath Absolute history file path.
 */
export async function appendRecordsToFile(records: UsageHistoryRecord[], filePath: string): Promise<void> {
	await mkdir(dirname(filePath), { recursive: true });
	await appendFile(filePath, records.map(serializeUsageHistoryRecord).join(""), "utf8");
	await compactUsageHistoryFile(filePath);
}
