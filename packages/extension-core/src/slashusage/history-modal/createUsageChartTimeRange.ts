import type { UsageHistoryRecord } from "../history/types.js";
import { parseUsageWindowDurationMs } from "./parseUsageWindowDurationMs.js";

export type UsageChartTimeRange = {
  end: number;
  resetAt?: number;
  start: number;
  windowStart?: number;
};

/**
 * Creates the chart time range, including future reset time when known.
 *
 * @param records Usage records in one chart series.
 * @returns Time range used for x-axis projection.
 */
export function createUsageChartTimeRange(records: UsageHistoryRecord[]): UsageChartTimeRange {
  const sorted = [...records].sort((left, right) => left.sampledAt - right.sampledAt);
  const first = sorted[0];
  const latest = sorted.at(-1);
  if (!first || !latest) return { start: 0, end: 1 };

  const resetAt = parseResetAt(latest.resetAt);
  const duration = parseUsageWindowDurationMs(latest.label);
  const windowStart = resetAt !== undefined && duration !== undefined ? resetAt - duration : undefined;
  const start = Math.min(first.sampledAt, windowStart ?? first.sampledAt);
  const end = Math.max(latest.sampledAt, resetAt ?? latest.sampledAt, start + 1);
  return {
    start,
    end,
    ...(resetAt !== undefined ? { resetAt } : {}),
    ...(windowStart !== undefined ? { windowStart } : {}),
  };
}

/**
 * Parses an ISO reset timestamp into epoch milliseconds.
 *
 * @param value Reset timestamp.
 * @returns Epoch milliseconds when valid.
 */
function parseResetAt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}
