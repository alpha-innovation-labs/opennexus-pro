import type { RtkGainPeriod } from "./RtkGainPeriod";

/**
 * Reads a daily RTK gain row date as a UTC day.
 *
 * @param period RTK gain period row.
 * @returns UTC date, or undefined when the row is not daily-dated.
 */
export function getRtkGainDailyDate(period: RtkGainPeriod): Date | undefined {
  if (!period.date) return undefined;
  const date = new Date(`${period.date}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
