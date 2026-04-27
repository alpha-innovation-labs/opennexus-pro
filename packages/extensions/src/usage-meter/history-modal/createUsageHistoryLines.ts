import type { UsageHistoryRecord } from "../history/types.js";
import { groupUsageHistoryRecords } from "./groupUsageHistoryRecords.js";
import { renderUsageHistorySeries } from "./renderUsageHistorySeries.js";

/**
 * Creates usage history graph lines for the modal.
 *
 * @param records Usage history records.
 * @param width Available pane width.
 * @returns Rendered modal body lines.
 */
export function createUsageHistoryLines(records: UsageHistoryRecord[], width: number): string[] {
  const series = groupUsageHistoryRecords(records).slice(-12);
  if (series.length === 0) return ["No usage history yet.", "Snapshots are captured every 5 minutes while Nexus is running."];
  return series.map((item) => renderUsageHistorySeries(item, width));
}
