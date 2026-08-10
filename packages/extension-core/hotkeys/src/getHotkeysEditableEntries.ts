import { filterHotkeysGroups } from "./filterHotkeysGroups.js";
import { getEditableHotkeysEntries } from "./getEditableHotkeysEntries.js";
import { getHotkeysGroups } from "./getHotkeysGroups.js";
import type { HotkeysEntry, HotkeysExtensionShortcut, HotkeysKeybindings } from "./types.js";

/**
 * Returns editable entries from the currently filtered hotkeys view.
 *
 * @param keybindings Active keybinding manager.
 * @param extensionShortcuts Registered extension shortcuts.
 * @param filterQuery Current filter query.
 * @returns Editable entries in display order.
 */
export function getHotkeysEditableEntries(keybindings: HotkeysKeybindings, extensionShortcuts: HotkeysExtensionShortcut[], filterQuery: string): HotkeysEntry[] {
  return getEditableHotkeysEntries(filterHotkeysGroups(getHotkeysGroups(keybindings, extensionShortcuts), filterQuery));
}
