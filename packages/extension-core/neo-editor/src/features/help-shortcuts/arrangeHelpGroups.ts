import type { HelpShortcutGroup } from "./types";

/**
 * Splits shortcut groups into balanced display columns.
 *
 * @param groups Groups to arrange.
 * @returns Two display columns.
 */
export function arrangeHelpGroups(
	groups: HelpShortcutGroup[],
): [HelpShortcutGroup[], HelpShortcutGroup[]] {
	const left: HelpShortcutGroup[] = [];
	const right: HelpShortcutGroup[] = [];
	let leftRows = 0;
	let rightRows = 0;

	for (const group of groups) {
		const rows = group.shortcuts.length + 3;
		if (leftRows <= rightRows) {
			left.push(group);
			leftRows += rows;
		} else {
			right.push(group);
			rightRows += rows;
		}
	}

	return [left, right];
}
