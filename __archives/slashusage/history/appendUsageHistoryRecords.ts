import { appendRecordsToFile } from "./appendRecordsToFile.js";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { getUsageHistoryModelFilePath } from "./getUsageHistoryModelFilePath.js";
import { getUsageHistoryModelKey } from "./getUsageHistoryModelKey.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Appends usage history records to the JSONL history file.
 *
 * @param records Usage history records.
 * @param filePath Optional file path override.
 */
export async function appendUsageHistoryRecords(records: UsageHistoryRecord[], filePath = getUsageHistoryFilePath()): Promise<void> {
	if (records.length === 0) return;
	if (filePath !== getUsageHistoryFilePath()) {
		await appendRecordsToFile(records, filePath);
		return;
	}

	const recordsByModel = new Map<string, UsageHistoryRecord[]>();
	for (const record of records) {
		const modelKey = getUsageHistoryModelKey(record);
		recordsByModel.set(modelKey, [...(recordsByModel.get(modelKey) ?? []), record]);
	}

	for (const [modelKey, modelRecords] of recordsByModel) {
		await appendRecordsToFile(modelRecords, getUsageHistoryModelFilePath(modelKey));
	}
}
