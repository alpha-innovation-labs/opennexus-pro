import { toKeyList } from "./toKeyList";
import type { HotkeysKeybindings } from "./types";

/**
 * Finds resolved keybindings that already use a candidate replacement key.
 *
 * @param keybindings Active keybindings manager.
 * @param keybindingId Keybinding being edited.
 * @param key Candidate replacement key.
 * @returns Conflicting keybinding ids.
 */
export function getHotkeysConflict(keybindings: HotkeysKeybindings, keybindingId: string, key: string): string[] {
  const resolved = keybindings.getResolvedBindings?.() ?? keybindings.getEffectiveConfig?.() ?? {};
  return Object.entries(resolved)
    .filter(([id, value]) => id !== keybindingId && toKeyList(value).includes(key))
    .map(([id]) => id);
}
