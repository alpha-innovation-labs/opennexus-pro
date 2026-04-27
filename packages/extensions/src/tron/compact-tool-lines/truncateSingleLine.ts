/**
 * Normalizes whitespace and truncates one line.
 *
 * @param text Input text.
 * @param max Maximum output length.
 * @returns Truncated line.
 */
export function truncateSingleLine(text: string, max = 120): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (!normalized) return "";
	if (normalized.length <= max) return normalized;
	return `${normalized.slice(0, max - 1)}…`;
}
