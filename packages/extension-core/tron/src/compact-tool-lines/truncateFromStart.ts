import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Truncates text from the start and keeps the tail visible.
 *
 * @param text Input text.
 * @param maxWidth Maximum visible width.
 * @param ellipsis Ellipsis marker.
 * @returns Start-truncated text.
 */
export function truncateFromStart(
	text: string,
	maxWidth: number,
	ellipsis = "…",
): string {
	if (maxWidth <= 0) return "";
	if (visibleWidth(text) <= maxWidth) return text;
	if (visibleWidth(ellipsis) >= maxWidth) return ellipsis;

	let result = "";
	for (let index = text.length - 1; index >= 0; index -= 1) {
		const candidate = text.slice(index);
		if (visibleWidth(ellipsis + candidate) > maxWidth) break;
		result = candidate;
	}
	return ellipsis + result;
}
