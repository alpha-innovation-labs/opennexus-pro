/**
 * Formats a UTC date as a daily period key.
 *
 * @param date Date to format.
 * @returns YYYY-MM-DD date key.
 */
export function formatUtcDateKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}
