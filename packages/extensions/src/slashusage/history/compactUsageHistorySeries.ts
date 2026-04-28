import { resampleUsageHistoryRecords } from "./resampleUsageHistoryRecords.js";
import type { UsageHistoryRecord } from "./types.js";

export const USAGE_HISTORY_MAX_POINTS_PER_SERIES = 1_000;

/**
 * Compacts one usage history series by resampling to a fixed cap across the full time range.
 *
 * @param records Records from one chart series.
 * @param maxPoints Maximum number of records to keep.
 * @returns Compacted records.
 */
export function compactUsageHistorySeries(records: UsageHistoryRecord[], maxPoints = USAGE_HISTORY_MAX_POINTS_PER_SERIES): UsageHistoryRecord[] {
	return resampleUsageHistoryRecords(records, maxPoints);
}
