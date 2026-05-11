import { padVisibleEnd } from "./padVisibleEnd.js";

/**
 * Crops and pads pane lines for a fixed viewport.
 *
 * @param lines Source lines.
 * @param width Pane width.
 * @param height Pane height.
 * @param stickToEnd Whether to show the last lines.
 * @returns Visible pane lines.
 */
export function renderAutomationPane(lines: string[], width: number, height: number, stickToEnd: boolean): string[] {
	const start = stickToEnd ? Math.max(0, lines.length - height) : 0;
	const visible = lines.slice(start, start + height).map((line) => padVisibleEnd(line, width));
	while (visible.length < height) visible.push(" ".repeat(width));
	return visible;
}
