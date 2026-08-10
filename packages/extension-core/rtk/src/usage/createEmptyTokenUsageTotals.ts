import type { TokenUsageTotals } from "./TokenUsageTotals";

/**
 * Creates a zeroed token usage total.
 *
 * @returns Empty token totals.
 */
export function createEmptyTokenUsageTotals(): TokenUsageTotals {
  return { cacheRead: 0, cacheWrite: 0, input: 0, output: 0, total: 0 };
}
