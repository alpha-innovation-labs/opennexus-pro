import type { UsageHistoryRecord, UsageHistoryUnit } from "../history/types.js";

/**
 * Computes the y-axis domain for one usage history series.
 *
 * @param records Series records.
 * @param unit Series unit.
 * @returns Inclusive min/max domain.
 */
export function getSeriesValueDomain(records: UsageHistoryRecord[], unit: UsageHistoryUnit): { min: number; max: number } {
  if (unit === "percent") return { min: 0, max: 100 };
  const max = Math.max(1, ...records.map((record) => record.value));
  return { min: 0, max };
}
