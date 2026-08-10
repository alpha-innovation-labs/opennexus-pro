import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Wraps plain text to the requested visible width.
 *
 * @param text Plain input text.
 * @param maxWidth Maximum visible width.
 * @returns Wrapped lines.
 */
export function wrapPlainText(text: string, maxWidth: number): string[] {
	if (maxWidth <= 0) return [""];
	if (!text) return [""];
	const result: string[] = [];
	let current = "";
	for (const char of Array.from(text)) {
		const next = current + char;
		if (visibleWidth(next) > maxWidth) {
			if (current) result.push(current);
			current = char;
			if (visibleWidth(current) > maxWidth) {
				result.push(current);
				current = "";
			}
			continue;
		}
		current = next;
	}
	if (current || result.length === 0) result.push(current);
	return result;
}
