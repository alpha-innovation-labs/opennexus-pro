import { averageUsageHistoryRecords } from "./averageUsageHistoryRecords.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Creates one averaged usage history record for an interior resampling bucket.
 *
 * @param records Non-empty records from the same series.
 * @returns Averaged record for the bucket.
 */
export function createUsageHistoryRecordWithAverages(records: UsageHistoryRecord[]): UsageHistoryRecord {
	return averageUsageHistoryRecords(records);
}
