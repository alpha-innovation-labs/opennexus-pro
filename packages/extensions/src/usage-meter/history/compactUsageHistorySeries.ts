import { averageUsageHistoryRecords } from "./averageUsageHistoryRecords.js";
import type { UsageHistoryRecord } from "./types.js";

export const USAGE_HISTORY_MAX_POINTS_PER_SERIES = 500;
export const USAGE_HISTORY_RECENT_POINTS_TO_KEEP = 400;

/**
 * Compacts one usage history series by averaging older records into buckets.
 *
 * @param records Records from one chart series.
 * @param maxPoints Maximum number of records to keep.
 * @returns Compacted records.
 */
export function compactUsageHistorySeries(records: UsageHistoryRecord[], maxPoints = USAGE_HISTORY_MAX_POINTS_PER_SERIES): UsageHistoryRecord[] {
  const sortedRecords = [...records].sort((left, right) => left.sampledAt - right.sampledAt);
  if (sortedRecords.length <= maxPoints) return sortedRecords;

  const recentCount = Math.min(USAGE_HISTORY_RECENT_POINTS_TO_KEEP, maxPoints - 1);
  const recentRecords = sortedRecords.slice(-recentCount);
  const olderRecords = sortedRecords.slice(0, -recentCount);
  const compactedOlderRecords = compactOlderRecords(olderRecords, maxPoints - recentCount);
  return [...compactedOlderRecords, ...recentRecords];
}

/**
 * Compacts older records into averaged buckets.
 *
 * @param records Older records to compact.
 * @param bucketLimit Maximum number of averaged buckets.
 * @returns Averaged older records.
 */
function compactOlderRecords(records: UsageHistoryRecord[], bucketLimit: number): UsageHistoryRecord[] {
  const bucketSize = Math.max(1, Math.ceil(records.length / Math.max(1, bucketLimit)));
  const compacted: UsageHistoryRecord[] = [];
  for (let index = 0; index < records.length; index += bucketSize) {
    compacted.push(averageUsageHistoryRecords(records.slice(index, index + bucketSize)));
  }
  return compacted;
}
