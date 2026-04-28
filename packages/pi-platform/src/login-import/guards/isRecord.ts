/**
 * Checks whether a value is a non-null object record.
 *
 * @param value Unknown value.
 * @returns True when the value can be indexed as a record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
