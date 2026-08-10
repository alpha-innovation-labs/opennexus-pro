/**
 * Normalizes an unknown cmux JSON index field.
 *
 * @param value Candidate numeric value.
 * @returns Numeric index or zero.
 */
export function normalizeCmuxIndex(value: unknown): number {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
