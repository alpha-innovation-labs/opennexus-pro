import type { UsageHistoryRecord } from "../history/types.js";
import { parseUsageWindowDurationMs } from "./parseUsageWindowDurationMs.js";

const RED = "\x1b[38;2;210;90;90m";
const TEAL = "\x1b[38;2;125;214;198m";
const RESET = "\x1b[0m";

export type UsagePaceStatus = {
  expectedPercent: number;
  usedPercent: number;
};

/**
 * Creates an over-pace warning for percent usage windows with a known reset.
 *
 * @param latest Latest usage history record.
 * @returns Pace status when current usage is ahead of the linear budget.
 */
export function createUsagePaceStatus(latest: UsageHistoryRecord): UsagePaceStatus | undefined {
  if (latest.unit !== "percent") return undefined;
  const resetAt = parseResetAt(latest.resetAt);
  const duration = parseUsageWindowDurationMs(latest.label);
  if (resetAt === undefined || duration === undefined) return undefined;

  const windowStart = resetAt - duration;
  const elapsedMs = latest.sampledAt - windowStart;
  if (elapsedMs <= 0) return undefined;
  const expectedPercent = calculateExpectedPercent(elapsedMs, duration);
  const usedPercent = Math.round(latest.value);

  return {
    expectedPercent,
    usedPercent,
  };
}

/**
 * Formats an over-pace warning for chart titles.
 *
 * @param status Pace status to format.
 * @returns ANSI-colored warning text.
 */
export function formatUsagePaceStatus(status: UsagePaceStatus): string {
  const prefix = status.usedPercent > status.expectedPercent ? "⚠ " : "";
  const color = status.usedPercent > status.expectedPercent ? RED : TEAL;
  return `${color}${prefix}${status.usedPercent}% / ${status.expectedPercent}%${RESET}`;
}

/**
 * Calculates the expected usage percentage for the window.
 *
 * @param elapsedMs Elapsed milliseconds in the current window.
 * @param durationMs Full window duration in milliseconds.
 * @returns Expected usage percentage.
 */
function calculateExpectedPercent(elapsedMs: number, durationMs: number): number {
  const elapsedRatio = Math.max(0, Math.min(1, elapsedMs / durationMs));
  return Math.round(elapsedRatio * 100);
}

/**
 * Parses a reset timestamp into epoch milliseconds.
 *
 * @param value Reset timestamp.
 * @returns Epoch milliseconds when valid.
 */
function parseResetAt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : undefined;
}
