import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { renderHotkeysPanel } from "./renderHotkeysPanel.js";
import type { HotkeysGroup } from "./types.js";

/**
 * Renders one column of hotkeys groups.
 *
 * @param uiTheme Active UI theme.
 * @param groups Groups assigned to the column.
 * @param width Column width.
 * @returns Rendered column lines.
 */
export function renderHotkeysColumn(uiTheme: SelectPreviewTheme, groups: HotkeysGroup[], width: number, focusedKeybindingId?: string, editingKeybindingId?: string): string[] {
  return groups.flatMap((group, index) => [
    ...(index === 0 ? [] : [""]),
    ...renderHotkeysPanel(uiTheme, group, width, focusedKeybindingId, editingKeybindingId),
  ]);
}
