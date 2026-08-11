import { truncateFromStart } from "./truncateFromStart";

/**
 * Normalizes whitespace and truncates one line from the start.
 *
 * @param text Input text.
 * @param max Maximum output width.
 * @returns Start-truncated line.
 */
export function truncateSingleLineFromStart(text: string, max = 120): string {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (!normalized) return "";
	return truncateFromStart(normalized, max);
}
