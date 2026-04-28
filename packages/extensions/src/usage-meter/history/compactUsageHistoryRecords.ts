import { compactUsageHistorySeries } from "./compactUsageHistorySeries.js";
import { getUsageHistorySeriesKey } from "./getUsageHistorySeriesKey.js";
import type { UsageHistoryRecord } from "./types.js";

/**
 * Compacts usage history records independently per chart series.
 *
 * @param records Usage history records.
 * @returns Compacted usage history records.
 */
export function compactUsageHistoryRecords(records: UsageHistoryRecord[]): UsageHistoryRecord[] {
  const groups = new Map<string, UsageHistoryRecord[]>();
  for (const record of records) {
    const key = getUsageHistorySeriesKey(record);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  return [...groups.values()]
    .flatMap((seriesRecords) => compactUsageHistorySeries(seriesRecords))
    .sort((left, right) => left.sampledAt - right.sampledAt);
}
