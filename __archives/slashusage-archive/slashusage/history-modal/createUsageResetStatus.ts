import { formatDuration } from "../shared/formatDuration.js";
import type { UsageHistoryRecord } from "../history/types.js";
import { getUsageChartRowColor, RESET } from "./colorUsageChartRow.js";
import type { UsageChartTimeRange } from "./createUsageChartTimeRange.js";

const PROGRESS_SEGMENTS = 5;

/**
 * Creates a reset countdown for a usage record.
 *
 * @param latest Latest usage history record.
 * @param timeRange Chart time range with reset metadata.
 * @returns Reset status text when reset timing is known.
 */
export function createUsageResetStatus(latest: UsageHistoryRecord, timeRange: UsageChartTimeRange): string | undefined {
  if (timeRange.resetAt === undefined || timeRange.windowStart === undefined) return undefined;
  const remainingSeconds = Math.max(0, (timeRange.resetAt - latest.sampledAt) / 1000);
  return formatDuration(remainingSeconds);
}

/**
 * Creates a colored elapsed-window progress bar for a usage record.
 *
 * @param latest Latest usage history record.
 * @param timeRange Chart time range with reset metadata.
 * @returns Colored progress bar when reset timing is known.
 */
export function createUsageProgressStatus(latest: UsageHistoryRecord, timeRange: UsageChartTimeRange): string | undefined {
  if (timeRange.resetAt === undefined || timeRange.windowStart === undefined) return undefined;
  return formatUsageWindowProgressBar(latest.sampledAt, timeRange, latest.value);
}

/**
 * Formats elapsed reset-window progress as a five-segment bar.
 *
 * @param sampledAt Latest sample timestamp.
 * @param timeRange Chart time range with reset metadata.
 * @param usedPercent Current usage percentage used to color the bar.
 * @returns Progress bar using filled and empty block glyphs.
 */
export function formatUsageWindowProgressBar(sampledAt: number, timeRange: UsageChartTimeRange, usedPercent = 0): string {
  if (timeRange.resetAt === undefined || timeRange.windowStart === undefined) return colorUsageProgressBar("▱".repeat(PROGRESS_SEGMENTS), usedPercent);
  const duration = Math.max(1, timeRange.resetAt - timeRange.windowStart);
  const ratio = Math.max(0, Math.min(1, (sampledAt - timeRange.windowStart) / duration));
  const filled = Math.max(0, Math.min(PROGRESS_SEGMENTS, Math.floor(ratio * PROGRESS_SEGMENTS)));
  return colorUsageProgressBar(`${"▰".repeat(filled)}${"▱".repeat(PROGRESS_SEGMENTS - filled)}`, usedPercent);
}

/**
 * Colors a compact usage progress bar by current usage amount.
 *
 * @param bar Progress bar text.
 * @param usedPercent Current usage percentage.
 * @returns ANSI-colored progress bar.
 */
function colorUsageProgressBar(bar: string, usedPercent: number): string {
  return `${getUsageChartRowColor(usedPercent)}${bar}${RESET}`;
}
