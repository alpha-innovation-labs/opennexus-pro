/**
 * Removes matching outer single or double quotes.
 *
 * @param value Raw query string.
 * @returns Unwrapped query.
 */
export function stripWrappedQuotes(value: string): string {
	if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
		return value.slice(1, -1);
	}
	if (value.startsWith("'") && value.endsWith("'") && value.length >= 2) {
		return value.slice(1, -1);
	}
	return value;
}
