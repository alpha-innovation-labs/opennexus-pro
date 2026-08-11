/**
 * Checks whether a value is a non-null object record.
 *
 * @param value Value to inspect.
 * @returns True when the value can be read as a record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
