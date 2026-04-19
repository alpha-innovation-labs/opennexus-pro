/**
 * Builds a fallback topic title from a user message.
 *
 * @param text User message text.
 * @returns Fallback topic title.
 */
export function buildFallbackTopicTitle(text: string): string {
	const singleLine = text.replace(/\s+/g, " ").trim();
	if (singleLine.length <= 48) return singleLine;
	return `${singleLine.slice(0, 47).trimEnd()}…`;
}
