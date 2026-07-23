import { compactUsageHistoryRecords } from "./compactUsageHistoryRecords.js";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { listUsageHistoryFilePaths } from "./listUsageHistoryFilePaths.js";
import { readUsageHistoryFile } from "./readUsageHistoryFile.js";
import { writeUsageHistoryRecords } from "./writeUsageHistoryRecords.js";

/**
 * Compacts the usage history file when any series exceeds the point limit.
 *
 * @param filePath Optional file path override.
 */
export async function compactUsageHistoryFile(filePath = getUsageHistoryFilePath()): Promise<void> {
	const filePaths = filePath === getUsageHistoryFilePath() ? await listUsageHistoryFilePaths() : [filePath];
	for (const path of filePaths) {
		const records = await readUsageHistoryFile(path);
		const compactedRecords = compactUsageHistoryRecords(records);
		if (compactedRecords.length === records.length) continue;
		await writeUsageHistoryRecords(compactedRecords, path);
	}
}
