import { arrangeHotkeysGroups } from "./arrangeHotkeysGroups.js";
import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysGroup } from "./types.js";

/**
 * Moves focus between the two rendered hotkey panes.
 *
 * @param groups Filtered hotkeys groups.
 * @param focusedEntryId Current focused entry id.
 * @param direction Pane direction.
 * @returns First entry id in the target pane, or the existing focus.
 */
export function resolveHotkeysPaneFocus(groups: HotkeysGroup[], focusedEntryId: string | undefined, direction: -1 | 1): string | undefined {
  const panes = arrangeHotkeysGroups(groups);
  const paneEntries = panes.map((pane) => pane.flatMap((group) => group.shortcuts));
  const currentPaneIndex = paneEntries.findIndex((entries) => entries.some((entry) => getHotkeysEntryFocusId(entry) === focusedEntryId));
  const targetPaneIndex = currentPaneIndex < 0 ? (direction > 0 ? 1 : 0) : (currentPaneIndex + direction + paneEntries.length) % paneEntries.length;
  return getHotkeysEntryFocusId(paneEntries[targetPaneIndex]?.[0] ?? paneEntries[currentPaneIndex]?.[0]);
}
