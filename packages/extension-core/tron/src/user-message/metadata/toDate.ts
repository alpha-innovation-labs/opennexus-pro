/**
 * Converts a timestamp-like value into a valid Date.
 *
 * @param value Timestamp value from a message or metadata object.
 * @returns Parsed Date, or undefined when the value is missing or invalid.
 */
export function toDate(
	value: Date | number | string | undefined,
): Date | undefined {
	if (value === undefined) return undefined;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}
