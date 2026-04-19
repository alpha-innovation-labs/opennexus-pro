import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Pads one rendered line to the requested visible width.
 *
 * @param line Input rendered line.
 * @param width Target width.
 * @returns Width-padded line.
 */
export function padToWidth(line: string, width: number): string {
	const truncated = truncateToWidth(line, width, "");
	return truncated + " ".repeat(Math.max(0, width - visibleWidth(truncated)));
}
