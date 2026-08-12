import type { SelectPreviewTheme } from "@nexus/tui-kit";
import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId";
import { padVisible } from "./padVisible";
import { renderHotkeysPanelTop } from "./renderHotkeysPanelTop";
import { truncateVisible } from "./truncateVisible";
import type { HotkeysGroup } from "./types";

/**
 * Renders one titled hotkeys panel.
 *
 * @param uiTheme Active UI theme.
 * @param group Shortcut group to render.
 * @param width Full panel width.
 * @returns Panel lines.
 */
export function renderHotkeysPanel(
	uiTheme: SelectPreviewTheme,
	group: HotkeysGroup,
	width: number,
	focusedKeybindingId?: string,
	editingKeybindingId?: string,
): string[] {
	const innerWidth = Math.max(1, width - 2);
	const keyWidth = Math.min(30, Math.max(8, Math.floor(innerWidth * 0.45)));
	const markerWidth = 2;
	const labelWidth = Math.max(1, innerWidth - keyWidth - markerWidth);
	const lines = [renderHotkeysPanelTop(uiTheme, group.title, width)];
	for (const shortcut of group.shortcuts) {
		const isEditing =
			Boolean(shortcut.keybindingId) &&
			shortcut.keybindingId === editingKeybindingId;
		const isFocused = getHotkeysEntryFocusId(shortcut) === focusedKeybindingId;
		const marker = isEditing
			? uiTheme.fg("warning", "● ")
			: isFocused
				? uiTheme.fg("accent", "▶ ")
				: "  ";
		const plainLabel = truncateVisible(shortcut.label, labelWidth);
		const plainKeys = truncateVisible(shortcut.keys, keyWidth);
		const labelText = isEditing
			? uiTheme.bold(plainLabel)
			: isFocused
				? uiTheme.fg("accent", plainLabel)
				: plainLabel;
		const label = padVisible(labelText, labelWidth);
		const keys = padVisible(
			uiTheme.fg(isEditing ? "warning" : "success", plainKeys),
			keyWidth,
		);
		lines.push(
			uiTheme.fg("borderMuted", "│") +
				marker +
				label +
				keys +
				uiTheme.fg("borderMuted", "│"),
		);
	}
	lines.push(uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
	return lines;
}
