/**
 * Normalizes an unknown cmux JSON boolean field.
 *
 * @param value Candidate boolean value.
 * @returns Boolean value or false.
 */
export function normalizeCmuxBoolean(value: unknown): boolean {
	return value === true;
}
