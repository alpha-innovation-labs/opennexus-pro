import type { SelectPreviewTheme } from "@nexus/tui-kit";
import { renderHotkeysPanel } from "./renderHotkeysPanel";
import type { HotkeysGroup } from "./types";

/**
 * Renders one column of hotkeys groups.
 *
 * @param uiTheme Active UI theme.
 * @param groups Groups assigned to the column.
 * @param width Column width.
 * @returns Rendered column lines.
 */
export function renderHotkeysColumn(
	uiTheme: SelectPreviewTheme,
	groups: HotkeysGroup[],
	width: number,
	focusedKeybindingId?: string,
	editingKeybindingId?: string,
): string[] {
	return groups.flatMap((group, index) => [
		...(index === 0 ? [] : [""]),
		...renderHotkeysPanel(
			uiTheme,
			group,
			width,
			focusedKeybindingId,
			editingKeybindingId,
		),
	]);
}
