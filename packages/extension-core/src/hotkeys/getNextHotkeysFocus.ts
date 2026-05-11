import { getHotkeysEntryFocusId } from "./getHotkeysEntryFocusId.js";
import type { HotkeysEntry } from "./types.js";

/**
 * Resolves the next focused editable entry after vim-style navigation.
 *
 * @param entries Editable entries in display order.
 * @param currentId Currently focused keybinding id.
 * @param direction Movement direction.
 * @returns Next focused keybinding id.
 */
export function getNextHotkeysFocus(entries: HotkeysEntry[], currentId: string | undefined, direction: -1 | 1): string | undefined {
  if (entries.length === 0) return undefined;
  const currentIndex = entries.findIndex((entry) => getHotkeysEntryFocusId(entry) === currentId);
  const baseIndex = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (baseIndex + direction + entries.length) % entries.length;
  return entries[nextIndex] ? getHotkeysEntryFocusId(entries[nextIndex]) : undefined;
}
