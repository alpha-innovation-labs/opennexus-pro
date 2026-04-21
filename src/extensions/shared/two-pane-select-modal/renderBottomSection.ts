import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import type { UITheme } from "./types.js";

/**
 * Renders the optional bottom input section for the modal.
 *
 * @param uiTheme UI theme.
 * @param showLeftPane Whether the left pane is shown.
 * @param showRightPane Whether the right pane is shown.
 * @param bottomTitle Bottom section title.
 * @param bottomPrefix Bottom prefix.
 * @param bottomValue Bottom value.
 * @param leftWidth Left-pane width.
 * @param rightWidth Right-pane width.
 * @param right Right-pane lines.
 * @param listHeight Visible list height.
 * @returns Bottom section lines.
 */
export function renderBottomSection(
	uiTheme: UITheme,
	showLeftPane: boolean,
	showRightPane: boolean,
	bottomTitle: string,
	bottomPrefix: string,
	bottomValue: string,
	leftWidth: number,
	rightWidth: number,
	right: string[],
	listHeight: number,
): string[] {
	const title = ` ${bottomTitle} `;
	const label = uiTheme.fg("accent", uiTheme.bold(title));
	if (showLeftPane && showRightPane) {
		const rule = Math.max(0, leftWidth - visibleWidth(title));
		const divider = uiTheme.fg("borderMuted", "├") + uiTheme.fg("borderMuted", "─".repeat(Math.floor(rule / 2))) + label + uiTheme.fg("borderMuted", "─".repeat(Math.ceil(rule / 2))) + uiTheme.fg("borderMuted", "┴");
		const rightLine = truncateToWidth(right[listHeight + 1] || "", rightWidth, "");
		const bottomLeft = truncateToWidth(uiTheme.fg("warning", `${bottomPrefix}${bottomValue}`), leftWidth, "");
		return [
			`${divider}${" ".repeat(rightWidth)}${uiTheme.fg("borderMuted", "│")}`,
			`${uiTheme.fg("borderMuted", "│")}${bottomLeft}${" ".repeat(Math.max(0, leftWidth - visibleWidth(bottomLeft)))}${rightLine}${" ".repeat(Math.max(0, rightWidth - visibleWidth(rightLine)))}${uiTheme.fg("borderMuted", "│")}`,
		];
	}
	const contentWidth = leftWidth + rightWidth + 1;
	const rule = Math.max(0, contentWidth - visibleWidth(title));
	const bottom = truncateToWidth(uiTheme.fg("warning", `${bottomPrefix}${bottomValue}`), contentWidth, "");
	return [
		uiTheme.fg("borderMuted", "├") + uiTheme.fg("borderMuted", "─".repeat(Math.floor(rule / 2))) + label + uiTheme.fg("borderMuted", "─".repeat(Math.ceil(rule / 2))) + uiTheme.fg("borderMuted", "┤"),
		`${uiTheme.fg("borderMuted", "│")}${bottom}${" ".repeat(Math.max(0, contentWidth - visibleWidth(bottom)))}${uiTheme.fg("borderMuted", "│")}`,
	];
}
