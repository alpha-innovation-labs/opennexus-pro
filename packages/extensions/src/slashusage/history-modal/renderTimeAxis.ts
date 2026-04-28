import { visibleWidth } from "@mariozechner/pi-tui";
import type { UsageHistoryRecord } from "../history/types.js";
import type { UsageChartTimeRange } from "./createUsageChartTimeRange.js";

/**
 * Renders a compact old-to-new time axis for selected chart points.
 *
 * @param points Chart points.
 * @param plotWidth Width of the plot area.
 * @param status Optional right-aligned reset and pace status.
 * @returns Time axis line.
 */
export function renderTimeAxis(points: UsageHistoryRecord[], plotWidth: number, timeRange?: UsageChartTimeRange, status?: string): string {
  if (points.length === 0) return "      ";
  const first = formatTime(timeRange?.start ?? points[0]!.sampledAt);
  const last = formatTime(timeRange?.end ?? points[points.length - 1]!.sampledAt);
  if (status) return renderRightAlignedStatus(`      ${first}`, status, 6 + plotWidth);
  const spacer = "─".repeat(Math.max(1, plotWidth - first.length - last.length - 1));
  return `      ${first}${spacer}${last}`;
}

/**
 * Renders a left axis label with status aligned to the far right.
 *
 * @param left Left-side axis text.
 * @param status Status text to place at the right edge.
 * @param width Total target visible width.
 * @returns Combined bottom-axis/status line.
 */
function renderRightAlignedStatus(left: string, status: string, width: number): string {
  const spacing = Math.max(1, width - visibleWidth(left) - visibleWidth(status));
  return `${left}${" ".repeat(spacing)}${status}`;
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
