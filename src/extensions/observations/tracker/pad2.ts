/**
 * Pads a number to two digits.
 *
 * @param value Numeric value.
 * @returns Two-digit string.
 */
export function pad2(value: number): string {
	return String(value).padStart(2, "0");
}
