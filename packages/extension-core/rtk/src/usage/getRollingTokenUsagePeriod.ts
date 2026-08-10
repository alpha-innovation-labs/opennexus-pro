import { formatUtcDateKey } from "../savings/formatUtcDateKey.js";
import { getRollingWindowStartDate } from "../savings/getRollingWindowStartDate.js";
import { aggregateTokenUsagePeriods } from "./aggregateTokenUsagePeriods.js";
import { getTokenUsageDailyDate } from "./getTokenUsageDailyDate.js";
import type { TokenUsagePeriod } from "./TokenUsagePeriod.js";

/**
 * Aggregates the latest rolling daily token usage window.
 *
 * @param periods Daily token usage rows.
 * @param days Number of calendar days to include.
 * @returns Aggregated usage period, or undefined when no daily rows exist.
 */
export function getRollingTokenUsagePeriod(periods: TokenUsagePeriod[], days: number): TokenUsagePeriod | undefined {
  const dated = periods
    .map((period) => ({ date: getTokenUsageDailyDate(period), period }))
    .filter((entry): entry is { date: Date; period: TokenUsagePeriod } => entry.date !== undefined)
    .sort((left, right) => left.date.getTime() - right.date.getTime());
  const latest = dated.at(-1)?.date;
  if (!latest) return undefined;
  const start = getRollingWindowStartDate(latest, days);
  const included = dated.filter((entry) => entry.date >= start && entry.date <= latest);
  return aggregateTokenUsagePeriods(`${formatUtcDateKey(included[0].date)}..${formatUtcDateKey(latest)}`, included.map((entry) => entry.period));
}
