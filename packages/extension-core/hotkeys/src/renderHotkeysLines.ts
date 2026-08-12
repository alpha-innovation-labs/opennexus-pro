import type { SelectPreviewTheme } from "@nexus/tui-kit";
import { arrangeFocusedHotkeysGroups } from "./arrangeFocusedHotkeysGroups";
import { padVisible } from "./padVisible";
import { renderHotkeysColumn } from "./renderHotkeysColumn";
import type { HotkeysGroup } from "./types";

/**
 * Renders arranged hotkeys groups into two-column modal content lines.
 *
 * @param uiTheme Active UI theme.
 * @param groups Filtered hotkeys groups.
 * @param dialogWidth Available dialog width.
 * @param focusedEntryId Focused keybinding id.
 * @param editingEntryId Editing keybinding id.
 * @returns Rendered two-column content lines.
 */
export function renderHotkeysLines(
	uiTheme: SelectPreviewTheme,
	groups: HotkeysGroup[],
	dialogWidth: number,
	focusedEntryId?: string,
	editingEntryId?: string,
): string[] {
	const gap = 2;
	const columnWidth = Math.floor((dialogWidth - gap) / 2);
	const [leftGroups, rightGroups] = arrangeFocusedHotkeysGroups(
		groups,
		focusedEntryId,
	);
	const leftLines = renderHotkeysColumn(
		uiTheme,
		leftGroups,
		columnWidth,
		focusedEntryId,
		editingEntryId,
	);
	const rightLines = renderHotkeysColumn(
		uiTheme,
		rightGroups,
		dialogWidth - columnWidth - gap,
		focusedEntryId,
		editingEntryId,
	);
	const height = Math.max(leftLines.length, rightLines.length);
	const lines: string[] = [];
	for (let index = 0; index < height; index += 1) {
		lines.push(
			padVisible(leftLines[index] ?? "", columnWidth) +
				" ".repeat(gap) +
				padVisible(rightLines[index] ?? "", dialogWidth - columnWidth - gap),
		);
	}
	if (groups.length === 0)
		lines.push(uiTheme.fg("dim", "No matching keybindings"));
	return lines;
}
