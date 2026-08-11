/**
 * Parses an `@` autocomplete prefix.
 *
 * @param prefix Raw prefix.
 * @returns Parsed query metadata.
 */
export function parseAtPrefix(prefix: string): {
	rawQuery: string;
	isQuotedPrefix: boolean;
} {
	if (prefix.startsWith('@"')) {
		return { rawQuery: prefix.slice(2), isQuotedPrefix: true };
	}
	return { rawQuery: prefix.slice(1), isQuotedPrefix: false };
}
