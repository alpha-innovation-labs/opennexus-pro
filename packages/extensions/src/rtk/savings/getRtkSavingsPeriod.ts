import type { RtkGainPeriod } from "./RtkGainPeriod.js";
import type { RtkGainReport } from "./RtkGainReport.js";
import type { RtkSavingsPeriodKey } from "./RtkSavingsPeriodKey.js";
import { getLatestRtkGainPeriod } from "./getLatestRtkGainPeriod.js";
import { getRollingRtkGainPeriod } from "./getRollingRtkGainPeriod.js";

/**
 * Resolves the latest RTK gain row for a selected period.
 *
 * @param report Parsed RTK gain report.
 * @param period Selected period key.
 * @returns Latest matching period row, if present.
 */
export function getRtkSavingsPeriod(report: RtkGainReport, period: RtkSavingsPeriodKey): RtkGainPeriod | undefined {
  if (period === "daily") return getLatestRtkGainPeriod(report.daily);
  if (period === "weekly") return getLatestRtkGainPeriod(report.weekly);
  return getRollingRtkGainPeriod(report.daily, 30) ?? getLatestRtkGainPeriod(report.monthly);
}
