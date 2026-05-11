import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Centers one Tetris content line inside a target width.
 *
 * @param line Rendered content line.
 * @param width Target visible width.
 * @returns Center-padded line.
 */
export function centerTetrisLine(line: string, width: number): string {
	const padding = Math.max(0, Math.floor((width - visibleWidth(line)) / 2));
	return `${" ".repeat(padding)}${line}`;
}
