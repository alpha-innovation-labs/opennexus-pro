/**
 * Quotes one shell token using POSIX single-quote escaping.
 *
 * @param value Token to quote.
 * @returns Safely quoted shell token.
 */
export function shellQuote(value: string): string {
	return `'${value.replaceAll("'", "'\\''")}'`;
}
