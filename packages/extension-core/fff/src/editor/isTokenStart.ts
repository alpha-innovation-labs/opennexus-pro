const PATH_DELIMITERS = new Set([" ", "\t", '"', "'", "="]);

/**
 * Checks whether a text index starts a token boundary.
 *
 * @param text Full text.
 * @param index Candidate token index.
 * @returns True when the token is boundary-safe.
 */
export function isTokenStart(text: string, index: number): boolean {
	return index === 0 || PATH_DELIMITERS.has(text[index - 1] ?? "");
}
