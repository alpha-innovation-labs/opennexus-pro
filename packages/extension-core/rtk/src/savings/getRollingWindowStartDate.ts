const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Computes the inclusive start date for a rolling day window.
 *
 * @param endDate Inclusive UTC end date.
 * @param days Number of calendar days in the window.
 * @returns Inclusive UTC start date.
 */
export function getRollingWindowStartDate(endDate: Date, days: number): Date {
	return new Date(endDate.getTime() - Math.max(days - 1, 0) * DAY_MS);
}
