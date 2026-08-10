import type { HotkeysEntry, HotkeysGroup } from "./types";

/**
 * Flattens editable keybinding entries from rendered hotkeys groups.
 *
 * @param groups Filtered hotkeys groups.
 * @returns Entries backed by a persisted keybinding id.
 */
export function getEditableHotkeysEntries(groups: HotkeysGroup[]): HotkeysEntry[] {
  return groups.flatMap((group) => group.shortcuts.filter((shortcut) => shortcut.keybindingId));
}
