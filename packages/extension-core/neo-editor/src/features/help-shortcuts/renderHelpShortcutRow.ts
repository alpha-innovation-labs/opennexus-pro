import type { SelectPreviewTheme } from "@nexus/tui-kit";
import { padVisible } from "./padVisible";
import type { HelpShortcut } from "./types";

/**
 * Renders one shortcut row inside a help panel.
 *
 * @param uiTheme Active UI theme.
 * @param shortcut Shortcut record.
 * @param innerWidth Panel inner width.
 * @returns Styled shortcut row.
 */
export function renderHelpShortcutRow(
	uiTheme: SelectPreviewTheme,
	shortcut: HelpShortcut,
	innerWidth: number,
): string {
	const keyWidth = Math.min(24, Math.max(8, Math.floor(innerWidth * 0.4)));
	const labelWidth = Math.max(1, innerWidth - keyWidth);
	const label = padVisible(shortcut.label.slice(0, labelWidth), labelWidth);
	const keys = padVisible(
		uiTheme.fg("success", shortcut.keys.slice(0, keyWidth)),
		keyWidth,
	);
	return label + keys;
}
