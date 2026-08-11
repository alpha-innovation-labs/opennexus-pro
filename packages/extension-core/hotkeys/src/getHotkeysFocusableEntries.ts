import { filterHotkeysGroups } from "./filterHotkeysGroups";
import { getHotkeysGroups } from "./getHotkeysGroups";
import type {
	HotkeysEntry,
	HotkeysExtensionShortcut,
	HotkeysKeybindings,
} from "./types";

/**
 * Returns all focusable entries from the current filtered hotkeys view.
 *
 * @param keybindings Active keybinding manager.
 * @param extensionShortcuts Registered extension shortcuts.
 * @param filterQuery Current filter query.
 * @returns Focusable entries in display order.
 */
export function getHotkeysFocusableEntries(
	keybindings: HotkeysKeybindings,
	extensionShortcuts: HotkeysExtensionShortcut[],
	filterQuery: string,
): HotkeysEntry[] {
	return filterHotkeysGroups(
		getHotkeysGroups(keybindings, extensionShortcuts),
		filterQuery,
	).flatMap((group) => group.shortcuts);
}
