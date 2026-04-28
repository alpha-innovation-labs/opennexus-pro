import type { UsageHistoryUnit } from "../history/types.js";

/**
 * Returns chart height for one usage unit.
 *
 * @param unit Usage unit.
 * @returns Chart height in terminal rows.
 */
export function getUsageChartHeight(unit: UsageHistoryUnit): number {
  return unit === "percent" ? 21 : 4;
}
