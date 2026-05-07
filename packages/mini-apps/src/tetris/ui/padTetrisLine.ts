import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Pads or truncates one rendered line to a target terminal width.
 *
 * @param line Rendered line.
 * @param width Target visible width.
 * @returns Width-normalized line.
 */
export function padTetrisLine(line: string, width: number): string {
	const truncated = truncateToWidth(line, width, "");
	return `${truncated}${" ".repeat(Math.max(0, width - visibleWidth(truncated)))}`;
}
