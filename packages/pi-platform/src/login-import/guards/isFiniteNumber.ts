/**
 * Checks whether a value is a finite number.
 *
 * @param value Unknown value.
 * @returns True when the value is a finite number.
 */
export function isFiniteNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}
