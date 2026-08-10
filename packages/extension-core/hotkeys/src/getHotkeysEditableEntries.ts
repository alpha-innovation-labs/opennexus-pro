import { filterHotkeysGroups } from "./filterHotkeysGroups";
import { getEditableHotkeysEntries } from "./getEditableHotkeysEntries";
import { getHotkeysGroups } from "./getHotkeysGroups";
import type { HotkeysEntry, HotkeysExtensionShortcut, HotkeysKeybindings } from "./types";

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
