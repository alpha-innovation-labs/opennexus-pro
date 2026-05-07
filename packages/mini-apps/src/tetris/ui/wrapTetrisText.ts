import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Wraps text at separator boundaries to fit a target width.
 *
 * @param parts Text parts to join and wrap.
 * @param width Target width.
 * @returns Wrapped lines.
 */
export function wrapTetrisText(parts: string[], width: number): string[] {
	const lines: string[] = [];
	let current = "";
	for (const part of parts) {
		const next = current ? `${current} | ${part}` : part;
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
