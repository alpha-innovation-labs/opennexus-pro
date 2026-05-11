import type { UsageHistoryRecord } from "./types.js";

/**
 * Removes exact duplicate usage history records while preserving first occurrence order.
 *
 * @param records Usage history records from one or more files.
 * @returns Deduplicated usage history records.
 */
export function dedupeUsageHistoryRecords(records: UsageHistoryRecord[]): UsageHistoryRecord[] {
	const seen = new Set<string>();
	const deduped: UsageHistoryRecord[] = [];
	for (const record of records) {
		const key = JSON.stringify(record);
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(record);
	}
	return deduped;
}
