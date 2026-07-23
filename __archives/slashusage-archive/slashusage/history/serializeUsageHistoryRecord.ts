import type { UsageHistoryRecord } from "./types.js";

/**
 * Serializes one usage history record as JSONL.
 *
 * @param record Usage history record.
 * @returns JSONL row.
 */
export function serializeUsageHistoryRecord(record: UsageHistoryRecord): string {
  return `${JSON.stringify(record)}\n`;
}
