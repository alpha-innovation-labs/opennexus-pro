/**
 * Builds a compact user-message excerpt for observation output.
 *
 * @param text Full user message text.
 * @returns Truncated one-line excerpt.
 */
export function buildObservationMessageExcerpt(text: string): string {
	const singleLine = text.replace(/\s+/g, " ").trim();
	if (singleLine.length <= 180) return singleLine;
	return `${singleLine.slice(0, 179).trimEnd()}…`;
}
