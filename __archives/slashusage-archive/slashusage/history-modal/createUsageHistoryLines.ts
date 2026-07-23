import type { UsageHistoryRecord } from "../history/types.js";
import { groupUsageHistoryRecords } from "./groupUsageHistoryRecords.js";
import { renderTimeSeriesChart } from "./renderTimeSeriesChart.js";

/**
 * Creates usage history graph lines for the modal.
 *
 * @param records Usage history records.
 * @param width Available pane width.
 * @param maxRows Maximum available body rows.
 * @returns Rendered modal body lines.
 */
export function createUsageHistoryLines(records: UsageHistoryRecord[], width: number, maxRows = Number.POSITIVE_INFINITY): string[] {
  const series = groupUsageHistoryRecords(records).slice(0, 1);
  if (series.length === 0) return ["No usage history yet.", "Snapshots are captured every 5 minutes while Nexus is running."].slice(0, maxRows);
  return renderTimeSeriesChart(series[0]!, width, maxRows).slice(0, maxRows);
}
