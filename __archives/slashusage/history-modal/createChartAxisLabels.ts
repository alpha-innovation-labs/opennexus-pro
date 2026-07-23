import { formatAxisLabel } from "./formatAxisLabel.js";
import type { UsageHistoryUnit } from "../history/types.js";

/**
 * Creates y-axis labels for one chart.
 *
 * @param rowCount Number of chart rows.
 * @param min Minimum value.
 * @param max Maximum value.
 * @param unit Usage unit.
 * @param percentStep Percent interval between chart rows.
 * @returns Axis labels aligned to chart rows.
 */
export function createChartAxisLabels(rowCount: number, min: number, max: number, unit: UsageHistoryUnit, percentStep = 5): string[] {
  if (unit === "percent") return Array.from({ length: rowCount }, (_unused, index) => formatAxisLabel(Math.max(0, 100 - index * percentStep), unit));
  return Array.from({ length: rowCount }, (_unused, index) => index === 0 ? formatAxisLabel(max, unit) : index === rowCount - 1 ? formatAxisLabel(min, unit) : "     ");
}
