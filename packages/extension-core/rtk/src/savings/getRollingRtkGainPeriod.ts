import { aggregateRtkGainPeriods } from "./aggregateRtkGainPeriods";
import { formatUtcDateKey } from "./formatUtcDateKey";
import { getRollingWindowStartDate } from "./getRollingWindowStartDate";
import { getRtkGainDailyDate } from "./getRtkGainDailyDate";
import type { RtkGainPeriod } from "./RtkGainPeriod";

/**
 * Aggregates the latest rolling daily RTK gain window.
 *
 * @param periods Daily RTK gain rows.
 * @param days Number of calendar days to include.
 * @returns Aggregated rolling period, or undefined when no daily rows exist.
 */
export function getRollingRtkGainPeriod(
	periods: RtkGainPeriod[] | undefined,
	days: number,
): RtkGainPeriod | undefined {
	const dated = (periods ?? [])
		.map((period) => ({ date: getRtkGainDailyDate(period), period }))
		.filter(
			(entry): entry is { date: Date; period: RtkGainPeriod } =>
				entry.date !== undefined,
		)
		.sort((left, right) => left.date.getTime() - right.date.getTime());
	const latest = dated.at(-1)?.date;
	if (!latest) return undefined;
	const start = getRollingWindowStartDate(latest, days);
	const included = dated.filter(
		(entry) => entry.date >= start && entry.date <= latest,
	);
	const aggregated = aggregateRtkGainPeriods(
		included.map((entry) => entry.period),
	);
	if (!aggregated) return undefined;
	aggregated.date = `${formatUtcDateKey(included[0].date)}..${formatUtcDateKey(latest)}`;
	return aggregated;
}
