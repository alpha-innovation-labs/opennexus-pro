import { resampleUsageHistoryRecords } from "../history/resampleUsageHistoryRecords.js";
import type { UsageHistoryRecord } from "../history/types.js";

/**
 * Selects resampled points that fit inside a chart width while spanning the full recorded range.
 *
 * @param records Sorted usage records.
 * @param width Chart width.
 * @returns Selected chart points.
 */
export function selectChartPoints(records: UsageHistoryRecord[], width: number): UsageHistoryRecord[] {
	return resampleUsageHistoryRecords(records, Math.max(1, Math.floor(width)));
}
