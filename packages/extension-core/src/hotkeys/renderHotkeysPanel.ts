import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { padVisible } from "./padVisible.js";
import { renderHotkeysPanelTop } from "./renderHotkeysPanelTop.js";
import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysGroup } from "./types.js";

/**
 * Renders one titled hotkeys panel.
 *
 * @param uiTheme Active UI theme.
 * @param group Shortcut group to render.
 * @param width Full panel width.
 * @returns Panel lines.
 */
export function renderHotkeysPanel(uiTheme: SelectPreviewTheme, group: HotkeysGroup, width: number, focusedKeybindingId?: string, editingKeybindingId?: string): string[] {
  const innerWidth = Math.max(1, width - 2);
  const keyWidth = Math.min(30, Math.max(8, Math.floor(innerWidth * 0.45)));
  const markerWidth = 2;
  const labelWidth = Math.max(1, innerWidth - keyWidth - markerWidth);
  const lines = [renderHotkeysPanelTop(uiTheme, group.title, width)];
  for (const shortcut of group.shortcuts) {
    const isEditing = Boolean(shortcut.keybindingId) && shortcut.keybindingId === editingKeybindingId;
    const isFocused = getHotkeysEntryFocusId(shortcut) === focusedKeybindingId;
    const marker = isEditing ? uiTheme.fg("warning", "● ") : isFocused ? uiTheme.fg("accent", "▶ ") : "  ";
    const labelText = isEditing ? uiTheme.bold(shortcut.label) : isFocused ? uiTheme.fg("accent", shortcut.label) : shortcut.label;
    const label = padVisible(labelText.slice(0, labelWidth), labelWidth);
    const keys = padVisible(uiTheme.fg(isEditing ? "warning" : "success", shortcut.keys.slice(0, keyWidth)), keyWidth);
    lines.push(uiTheme.fg("borderMuted", "│") + marker + label + keys + uiTheme.fg("borderMuted", "│"));
  }
  lines.push(uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
  return lines;
}
