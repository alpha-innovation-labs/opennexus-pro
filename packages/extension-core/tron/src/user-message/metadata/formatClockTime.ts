/**
 * Formats a date as a 12-hour clock label.
 *
 * @param date Date to format in the user's local timezone.
 * @returns Time label such as "3:34 PM".
 */
export function formatClockTime(date: Date): string {
	const rawHours = date.getHours();
	const hours = rawHours % 12 || 12;
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const suffix = rawHours >= 12 ? "PM" : "AM";
	return `${hours}:${minutes} ${suffix}`;
}
