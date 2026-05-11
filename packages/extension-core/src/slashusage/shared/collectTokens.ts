/**
 * Normalizes an identifier into comparable lowercase tokens.
 *
 * @param value Source text.
 * @returns Comparable token list.
 */
export function collectTokens(value: string | undefined): string[] {
	return (value ?? "")
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
}
