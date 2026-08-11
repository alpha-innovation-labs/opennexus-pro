import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Wraps text at separator boundaries to fit a target width.
 *
 * @param parts Text parts to join and wrap.
 * @param width Target width.
 * @param separator Separator between entries.
 * @returns Wrapped lines.
 */
export function wrapTetrisText(
	parts: string[],
	width: number,
	separator = " | ",
): string[] {
	const lines: string[] = [];
	let current = "";
	for (const part of parts) {
		const next = current ? `${current}${separator}${part}` : part;
		if (visibleWidth(next) <= width) {
			current = next;
			continue;
		}
		if (current) lines.push(current);
		current = part;
	}
	if (current) lines.push(current);
	return lines;
}
