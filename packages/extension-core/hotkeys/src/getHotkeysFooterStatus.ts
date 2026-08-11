import { getHotkeysFooterText } from "./getHotkeysFooterText";

/**
 * Resolves the hotkeys modal footer for conflict, editing, status, or navigation states.
 *
 * @param pendingConflict Whether conflict approval is active.
 * @param editingEntryId Keybinding currently being edited.
 * @param statusMessage Latest status message.
 * @param filterActive Whether filter mode is active.
 * @param filterQuery Current filter query.
 * @param scrollOffset Current scroll offset.
 * @param maxScroll Maximum scroll offset.
 * @returns Footer text.
 */
export function getHotkeysFooterStatus(
	pendingConflict: boolean,
	editingEntryId: string | undefined,
	statusMessage: string,
	filterActive: boolean,
	filterQuery: string,
	scrollOffset: number,
	maxScroll: number,
): string {
	if (pendingConflict) return "Conflict approval required";
	if (editingEntryId)
		return `Editing ${editingEntryId}: press the replacement key`;
	return (
		statusMessage ||
		getHotkeysFooterText(filterActive, filterQuery, scrollOffset, maxScroll)
	);
}
