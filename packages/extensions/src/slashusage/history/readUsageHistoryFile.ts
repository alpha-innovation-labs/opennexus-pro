import { readFile } from "node:fs/promises";
import { parseUsageHistoryRecord } from "./parseUsageHistoryRecord.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Reads usage history records from one JSONL file.
 *
 * @param filePath Absolute history file path.
 * @returns Parsed usage history records.
 */
export async function readUsageHistoryFile(filePath: string): Promise<UsageHistoryRecord[]> {
	try {
		const lines = (await readFile(filePath, "utf8")).trim().split(/\r?\n/).filter(Boolean);
		return lines.flatMap((line) => parseUsageHistoryRecord(line) ?? []);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}
