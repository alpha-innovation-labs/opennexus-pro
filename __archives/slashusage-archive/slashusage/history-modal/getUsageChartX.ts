import type { UsageChartTimeRange } from "./createUsageChartTimeRange.js";

/**
 * Projects a timestamp into the chart's horizontal character coordinate.
 *
 * @param timestamp Epoch milliseconds to project.
 * @param range Visible chart time range.
 * @param width Chart width in terminal cells.
 * @returns Character x coordinate clamped to the chart bounds.
 */
export function getUsageChartX(timestamp: number, range: UsageChartTimeRange, width: number): number {
  const normalizedWidth = Math.max(1, Math.floor(width));
  const span = Math.max(1, range.end - range.start);
  const ratio = Math.max(0, Math.min(1, (timestamp - range.start) / span));
  return Math.round(ratio * (normalizedWidth - 1));
}
