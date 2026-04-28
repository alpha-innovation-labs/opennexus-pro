import type { UsageHistoryRecord } from "../history/types.js";

/**
 * Renders a compact old-to-new time axis for selected chart points.
 *
 * @param points Chart points.
 * @param plotWidth Width of the plot area.
 * @returns Time axis line.
 */
export function renderTimeAxis(points: UsageHistoryRecord[], plotWidth: number): string {
  if (points.length === 0) return "      ";
  const first = formatTime(points[0]!.sampledAt);
  const last = formatTime(points[points.length - 1]!.sampledAt);
  const spacer = "─".repeat(Math.max(1, plotWidth - first.length - last.length - 1));
  return `      ${first}${spacer}${last}`;
}

/**
 * Formats a timestamp for the chart x-axis.
 *
 * @param timestamp Timestamp in milliseconds.
 * @returns HH:MM label.
 */
function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
