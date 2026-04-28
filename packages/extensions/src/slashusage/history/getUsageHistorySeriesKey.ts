import type { UsageHistoryRecord } from "./types.js";

/**
 * Creates a stable grouping key for one usage history chart series.
 *
 * @param record Usage history record.
 * @returns Series grouping key.
 */
export function getUsageHistorySeriesKey(record: UsageHistoryRecord): string {
  return [record.provider, record.label, record.modelId ?? "all", record.unit].join("|");
}
