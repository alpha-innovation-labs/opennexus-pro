import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { getUsageHistoryModelsDirPath } from "./getUsageHistoryModelsDirPath.js";

/**
 * Lists per-model usage history files plus the legacy combined file when present.
 *
 * @returns Absolute JSONL history file paths.
 */
export async function listUsageHistoryFilePaths(): Promise<string[]> {
	const historyFilePaths = [getUsageHistoryFilePath()];
	try {
		const entries = await readdir(getUsageHistoryModelsDirPath(), { withFileTypes: true });
		historyFilePaths.push(...entries
			.filter((entry) => entry.isFile() && entry.name.endsWith(".jsonl"))
			.map((entry) => join(getUsageHistoryModelsDirPath(), entry.name))
			.sort());
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
	}
	return historyFilePaths;
}
