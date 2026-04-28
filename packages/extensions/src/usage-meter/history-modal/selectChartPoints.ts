import type { UsageHistoryRecord } from "../history/types.js";

/**
 * Selects the latest points that fit inside a chart width.
 *
 * @param records Sorted usage records.
 * @param width Chart width.
 * @returns Selected chart points.
 */
export function selectChartPoints(records: UsageHistoryRecord[], width: number): UsageHistoryRecord[] {
  const pointCount = Math.max(1, Math.min(width, records.length));
  return records.slice(Math.max(0, records.length - pointCount));
}
