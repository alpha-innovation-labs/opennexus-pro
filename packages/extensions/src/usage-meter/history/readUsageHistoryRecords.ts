import { readFile } from "node:fs/promises";
import { getUsageHistoryFilePath } from "./getUsageHistoryFilePath.js";
import { parseUsageHistoryRecord } from "./parseUsageHistoryRecord.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Reads usage history records from disk.
 *
 * @param filePath Optional file path override.
 * @param limit Maximum records to return from the tail.
 * @returns Parsed usage history records.
 */
export async function readUsageHistoryRecords(filePath = getUsageHistoryFilePath(), limit = 1_000): Promise<UsageHistoryRecord[]> {
  try {
    const lines = (await readFile(filePath, "utf8")).trim().split(/\r?\n/).filter(Boolean);
    return lines.slice(Math.max(0, lines.length - limit)).flatMap((line) => parseUsageHistoryRecord(line) ?? []);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}
