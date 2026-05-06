import type { WhichKeyKeybindings } from "./types.js";

/**
 * Reads resolved keybindings from the injected Pi keybinding manager.
 *
 * @param keybindings Pi keybinding manager.
 * @returns Resolved keybinding map.
 */
export function getResolvedWhichKeyBindings(keybindings: WhichKeyKeybindings): Record<string, string | string[] | undefined> {
  return keybindings.getResolvedBindings?.() ?? keybindings.getEffectiveConfig?.() ?? {};
}
