import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Wraps plain text into a bounded number of display lines.
 *
 * @param text Source text.
 * @param width Available line width.
 * @param maxLines Maximum line count.
 * @returns Wrapped lines.
 */
export function wrapTextLines(text: string, width: number, maxLines: number): string[] {
	const normalized = text.replace(/\s+/g, " ").trim();
	if (!normalized) return [""];
	const words = normalized.split(" ");
	const lines: string[] = [];
	let current = "";
	for (const word of words) {
		const next = current ? `${current} ${word}` : word;
		if (visibleWidth(next) <= width) {
			current = next;
			continue;
		}
		if (current) lines.push(current);
		current = word;
		if (lines.length >= maxLines - 1) break;
	}
	if (lines.length < maxLines && current) lines.push(current);
	if (lines.length === 0) return [truncateToWidth(normalized, width, "…")];
	const consumed = lines.join(" ");
	if (normalized.length > consumed.length) {
		lines[lines.length - 1] = truncateToWidth(lines[lines.length - 1] || "", width, "…");
	}
	return lines.slice(0, maxLines);
}
