/**
 * Formats a context-window size for model catalog columns.
 *
 * @param contextWindow Context-window token count.
 * @returns Locale-free grouped token count.
 */
export function formatContextWindow(contextWindow: number): string {
	if (!Number.isFinite(contextWindow) || contextWindow <= 0) return "0";
	return Math.trunc(contextWindow).toLocaleString("en-US");
}
