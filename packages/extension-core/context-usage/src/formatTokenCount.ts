/**
 * Formats a token count with compact thousands suffixes.
 *
 * @param tokens Token count.
 * @returns Human-readable token count.
 */
export function formatTokenCount(tokens: number): string {
	if (tokens >= 1000)
		return `${Number((tokens / 1000).toFixed(tokens >= 10000 ? 1 : 2)).toLocaleString()}k`;
	return tokens.toLocaleString();
}
