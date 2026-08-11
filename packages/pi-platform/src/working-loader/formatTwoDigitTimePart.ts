/**
 * Formats a time part as at least two digits.
 *
 * @param value Numeric time part.
 * @returns Two-digit time part.
 */
export function formatTwoDigitTimePart(value: number): string {
	return Math.max(0, Math.floor(value)).toString().padStart(2, "0");
}
