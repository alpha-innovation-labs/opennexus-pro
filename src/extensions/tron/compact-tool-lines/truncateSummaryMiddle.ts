/**
 * Normalizes whitespace and truncates text in the middle.
 *
 * @param text Input text.
 * @param max Maximum output length.
 * @returns Truncated summary.
 */
export function truncateSummaryMiddle(text: string, max = 140): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (!normalized) return "";
	if (normalized.length <= max) return normalized;
	const keep = max - 1;
	const left = Math.ceil(keep / 2);
	const right = Math.floor(keep / 2);
	return `${normalized.slice(0, left)}…${normalized.slice(normalized.length - right)}`;
}
