import { visibleWidth } from "@earendil-works/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit";

/**
 * Renders one titled hotkeys panel top border.
 *
 * @param uiTheme Active UI theme.
 * @param title Panel title.
 * @param width Full panel width.
 * @returns Styled border line.
 */
export function renderHotkeysPanelTop(
	uiTheme: SelectPreviewTheme,
	title: string,
	width: number,
): string {
	const text = ` ${title} `;
	const innerWidth = Math.max(1, width - 2);
	const rule = Math.max(0, innerWidth - visibleWidth(text));
	return (
		uiTheme.fg("borderMuted", "┌") +
		uiTheme.fg("borderMuted", "─".repeat(Math.floor(rule / 2))) +
		uiTheme.fg("accent", uiTheme.bold(text)) +
		uiTheme.fg("borderMuted", "─".repeat(Math.ceil(rule / 2))) +
		uiTheme.fg("borderMuted", "┐")
	);
}
