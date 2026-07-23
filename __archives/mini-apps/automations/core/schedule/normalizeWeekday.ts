/**
 * Normalizes JavaScript and cron Sunday values.
 *
 * @param weekday Weekday number where Sunday can be 0 or 7.
 * @returns Weekday number with Sunday as 0.
 */
export function normalizeWeekday(weekday: number): number {
	return weekday === 7 ? 0 : weekday;
}
