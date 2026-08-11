import type { TokenUsagePeriod } from "./TokenUsagePeriod";

/**
 * Reads a token usage daily key as a UTC day.
 *
 * @param period Token usage period.
 * @returns UTC date, or undefined when the key is not a daily date.
 */
export function getTokenUsageDailyDate(
	period: TokenUsagePeriod,
): Date | undefined {
	if (!/^\d{4}-\d{2}-\d{2}$/u.test(period.key)) return undefined;
	const date = new Date(`${period.key}T00:00:00.000Z`);
	return Number.isNaN(date.getTime()) ? undefined : date;
}
