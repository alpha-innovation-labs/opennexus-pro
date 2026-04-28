import type { UsageHistoryUnit } from "../history/types.js";
import { getUsagePercentAxisStep } from "./getUsagePercentAxisStep.js";

/**
 * Returns chart height for one usage unit.
 *
 * @param unit Usage unit.
 * @param availableRows Rows available for title, chart, and time axis.
 * @returns Chart height in terminal rows.
 */
export function getUsageChartHeight(unit: UsageHistoryUnit, availableRows = Number.POSITIVE_INFINITY): number {
  if (unit !== "percent") return Math.max(1, Math.min(4, availableRows - 2));
  if (availableRows < 5) return Math.max(1, availableRows - 2);
  return Math.floor(100 / getUsagePercentAxisStep(availableRows)) + 1;
}
