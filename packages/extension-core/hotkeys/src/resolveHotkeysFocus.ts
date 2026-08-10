import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysEntry } from "./types.js";

/**
 * Keeps focus on an editable entry in the current filtered view.
 *
 * @param entries Editable entries in display order.
 * @param focusedEntryId Current focused keybinding id.
 * @returns Existing or first available focused keybinding id.
 */
export function resolveHotkeysFocus(entries: HotkeysEntry[], focusedEntryId: string | undefined): string | undefined {
  if (entries.length === 0) return undefined;
  return entries.some((entry) => getHotkeysEntryFocusId(entry) === focusedEntryId) ? focusedEntryId : entries[0] ? getHotkeysEntryFocusId(entries[0]) : undefined;
}
