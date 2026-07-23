import type { RtkGainPeriod } from "./RtkGainPeriod.js";
import type { RtkGainReport } from "./RtkGainReport.js";

/**
 * Finds the first date covered by an RTK gain report.
 *
 * @param report RTK gain report.
 * @returns Earliest UTC date, or epoch when unavailable.
 */
export function getEarliestRtkGainDate(report: RtkGainReport): Date {
  const keys = [report.daily, report.weekly, report.monthly]
    .flatMap((periods) => periods ?? [])
    .map(getPeriodStartKey)
    .filter((key): key is string => Boolean(key))
    .sort();
  return new Date(`${keys[0] ?? "1970-01-01"}T00:00:00.000Z`);
}

/**
 * Gets a sortable start key from an RTK period.
 *
 * @param period RTK period.
 * @returns Start key.
 */
function getPeriodStartKey(period: RtkGainPeriod): string | undefined {
  return period.date ?? period.week_start ?? period.month;
}
