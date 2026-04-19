import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { UITheme } from "./types.js";

/**
 * Renders one content row for the modal body.
 *
 * @param uiTheme UI theme.
 * @param showLeftPane Whether the left pane is shown.
 * @param showRightPane Whether the right pane is shown.
 * @param leftContent Left-pane content.
 * @param rightContent Right-pane content.
 * @param leftWidth Left-pane width.
 * @param rightWidth Right-pane width.
 * @returns Row line.
 */
export function renderRow(
	uiTheme: UITheme,
	showLeftPane: boolean,
	showRightPane: boolean,
	leftContent: string,
	rightContent: string,
	leftWidth: number,
	rightWidth: number,
): string {
	if (showLeftPane && showRightPane) {
		const left = truncateToWidth(leftContent, leftWidth, "");
		const right = truncateToWidth(rightContent, rightWidth, "");
		return `${uiTheme.fg("borderMuted", "│")}${left}${" ".repeat(Math.max(0, leftWidth - visibleWidth(left)))}${uiTheme.fg("borderMuted", "│")}${right}${" ".repeat(Math.max(0, rightWidth - visibleWidth(right)))}${uiTheme.fg("borderMuted", "│")}`;
	}
	const contentWidth = leftWidth + rightWidth + 1;
	const content = truncateToWidth(showLeftPane ? leftContent : rightContent, contentWidth, "");
	return `${uiTheme.fg("borderMuted", "│")}${content}${" ".repeat(Math.max(0, contentWidth - visibleWidth(content)))}${uiTheme.fg("borderMuted", "│")}`;
}
