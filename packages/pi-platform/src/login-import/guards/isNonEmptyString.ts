/**
 * Checks whether a value is a non-empty string.
 *
 * @param value Unknown value.
 * @returns True when the value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === "string" && value.trim().length > 0;
}
