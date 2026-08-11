/**
 * Finds the first prompt line matching a predicate.
 *
 * @param lines Prompt lines.
 * @param predicate Line matcher.
 * @returns Matching zero-based line index, or -1.
 */
export function findPromptLineIndex(
	lines: readonly string[],
	predicate: (line: string) => boolean,
): number {
	return lines.findIndex(predicate);
}
