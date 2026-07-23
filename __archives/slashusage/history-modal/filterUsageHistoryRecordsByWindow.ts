import type { UsageHistoryRecord } from "../history/types.js";
import type { UsageHistoryWindowOption } from "./types.js";

/**
 * Filters usage history records by the selected usage window.
 *
 * @param records Usage history records.
 * @param selectedWindow Selected usage window.
 * @returns Filtered records.
 */
export function filterUsageHistoryRecordsByWindow(records: UsageHistoryRecord[], selectedWindow: UsageHistoryWindowOption): UsageHistoryRecord[] {
  return records.filter((record) => selectedWindow === "5h" ? isFiveHourLabel(record.label) : isWeeklyLabel(record.label));
}

/** Returns whether a label represents a five-hour window. */
function isFiveHourLabel(label: string): boolean {
  return /(^|\s)5h($|\s)/i.test(label);
}

/** Returns whether a label represents a weekly window. */
function isWeeklyLabel(label: string): boolean {
  return /(^|\s)(week|1w|7d)($|\s)/i.test(label);
}
