import { dedupeUsageHistoryRecords } from "./dedupeUsageHistoryRecords.js";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { listUsageHistoryFilePaths } from "./listUsageHistoryFilePaths.js";
import { readUsageHistoryFile } from "./readUsageHistoryFile.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Reads usage history records from disk.
 *
 * @param filePath Optional file path override.
 * @param limit Maximum records to return from the tail.
 * @returns Parsed usage history records.
 */
export async function readUsageHistoryRecords(filePath = getUsageHistoryFilePath(), limit = Number.MAX_SAFE_INTEGER): Promise<UsageHistoryRecord[]> {
	const filePaths = filePath === getUsageHistoryFilePath() ? await listUsageHistoryFilePaths() : [filePath];
	const records = dedupeUsageHistoryRecords((await Promise.all(filePaths.map((path) => readUsageHistoryFile(path))))
		.flat())
		.sort((left, right) => left.sampledAt - right.sampledAt);
	return records.slice(Math.max(0, records.length - limit));
}
