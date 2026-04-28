/**
 * Normalizes an unknown cmux JSON string field.
 *
 * @param value Candidate string value.
 * @returns Trimmed string or an empty string.
 */
export function normalizeCmuxString(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}
