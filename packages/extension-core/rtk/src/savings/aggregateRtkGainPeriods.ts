import type { RtkGainPeriod } from "./RtkGainPeriod";

/**
 * Aggregates RTK gain rows into one combined savings period.
 *
 * @param periods Period rows to sum.
 * @returns Combined RTK gain period, or undefined when there are no rows.
 */
export function aggregateRtkGainPeriods(
	periods: RtkGainPeriod[],
): RtkGainPeriod | undefined {
	if (periods.length === 0) return undefined;
	const total = periods.reduce<RtkGainPeriod>(
		(accumulator, period) => ({
			avg_time_ms: 0,
			commands: accumulator.commands + period.commands,
			input_tokens: accumulator.input_tokens + period.input_tokens,
			output_tokens: accumulator.output_tokens + period.output_tokens,
			saved_tokens: accumulator.saved_tokens + period.saved_tokens,
			savings_pct: 0,
			total_time_ms: accumulator.total_time_ms + period.total_time_ms,
		}),
		{
			avg_time_ms: 0,
			commands: 0,
			input_tokens: 0,
			output_tokens: 0,
			saved_tokens: 0,
			savings_pct: 0,
			total_time_ms: 0,
		},
	);
	total.avg_time_ms =
		total.commands > 0 ? total.total_time_ms / total.commands : 0;
	total.savings_pct =
		total.input_tokens > 0
			? (total.saved_tokens / total.input_tokens) * 100
			: 0;
	return total;
}
