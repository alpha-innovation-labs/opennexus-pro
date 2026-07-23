import type { UsageHistoryRecord } from "../history/types.js";

/**
 * Derives the model/subscription label represented by one usage history record.
 *
 * @param record Usage history record.
 * @returns Model/subscription label.
 */
export function getUsageHistoryRecordModelLabel(record: UsageHistoryRecord): string {
  const strippedLabel = record.label.replace(/\b(5h|week|1w|7d|day)\b/gi, "").replace(/\s+/g, " ").trim();
  return strippedLabel || record.provider;
}
