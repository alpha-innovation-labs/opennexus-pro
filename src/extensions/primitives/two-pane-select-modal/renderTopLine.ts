import { visibleWidth } from "@mariozechner/pi-tui";
import type { UITheme } from "./types.js";

/**
 * Renders the titled top border for the modal.
 *
 * @param uiTheme UI theme.
 * @param showLeftPane Whether the left pane is shown.
 * @param showRightPane Whether the right pane is shown.
 * @param leftTitle Left pane title.
 * @param rightTitle Right pane title.
 * @param leftWidth Left pane width.
 * @param rightWidth Right pane width.
 * @returns Top border line.
 */
export function renderTopLine(
	uiTheme: UITheme,
	showLeftPane: boolean,
	showRightPane: boolean,
	leftTitle: string,
	rightTitle: string,
	leftWidth: number,
	rightWidth: number,
): string {
	if (showLeftPane && showRightPane) {
		const left = ` ${leftTitle} `;
		const right = ` ${rightTitle} `;
		const leftRule = Math.max(0, leftWidth - visibleWidth(left));
		const rightRule = Math.max(0, rightWidth - visibleWidth(right));
		return uiTheme.fg("borderMuted", "┌") + uiTheme.fg("borderMuted", "─".repeat(Math.floor(leftRule / 2))) + uiTheme.fg("accent", uiTheme.bold(left)) + uiTheme.fg("borderMuted", "─".repeat(Math.ceil(leftRule / 2))) + uiTheme.fg("borderMuted", "┬") + uiTheme.fg("borderMuted", "─".repeat(Math.floor(rightRule / 2))) + uiTheme.fg("accent", uiTheme.bold(right)) + uiTheme.fg("borderMuted", "─".repeat(Math.ceil(rightRule / 2))) + uiTheme.fg("borderMuted", "┐");
	}
	const title = ` ${showLeftPane ? leftTitle : rightTitle} `;
	const totalWidth = leftWidth + rightWidth + 1;
	const rule = Math.max(0, totalWidth - visibleWidth(title));
	return uiTheme.fg("borderMuted", "┌") + uiTheme.fg("borderMuted", "─".repeat(Math.floor(rule / 2))) + uiTheme.fg("accent", uiTheme.bold(title)) + uiTheme.fg("borderMuted", "─".repeat(Math.ceil(rule / 2))) + uiTheme.fg("borderMuted", "┐");
}
