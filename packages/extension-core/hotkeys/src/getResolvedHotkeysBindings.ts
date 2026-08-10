import type { HotkeysKeybindings } from "./types.js";

/**
 * Reads resolved keybindings from the injected Pi keybinding manager.
 *
 * @param keybindings Pi keybinding manager.
 * @returns Resolved keybinding map.
 */
export function getResolvedHotkeysBindings(keybindings: HotkeysKeybindings): Record<string, string | string[] | undefined> {
  return keybindings.getResolvedBindings?.() ?? keybindings.getEffectiveConfig?.() ?? {};
}
