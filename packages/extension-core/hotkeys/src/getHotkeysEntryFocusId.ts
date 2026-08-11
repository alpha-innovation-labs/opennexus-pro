import type { HotkeysEntry } from "./types";

/**
 * Returns a stable focus id for editable and static hotkey entries.
 *
 * @param entry Which-key entry.
 * @returns Stable focus id.
 */
export function getHotkeysEntryFocusId(entry: HotkeysEntry): string {
	return entry.keybindingId ?? `${entry.label}\u0000${entry.keys}`;
}
