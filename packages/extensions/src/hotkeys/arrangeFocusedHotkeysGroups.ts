import { arrangeHotkeysGroups } from "./arrangeHotkeysGroups.js";
import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysGroup } from "./types.js";

/**
 * Arranges hotkey panes so the pane containing focus is always rendered left.
 *
 * @param groups Filtered groups.
 * @param focusedEntryId Focused entry id.
 * @returns Left and right columns with focused pane first.
 */
export function arrangeFocusedHotkeysGroups(groups: HotkeysGroup[], focusedEntryId?: string): [HotkeysGroup[], HotkeysGroup[]] {
  const [left, right] = arrangeHotkeysGroups(groups);
  const rightHasFocus = right.some((group) => group.shortcuts.some((entry) => getHotkeysEntryFocusId(entry) === focusedEntryId));
  return rightHasFocus ? [right, left] : [left, right];
}
