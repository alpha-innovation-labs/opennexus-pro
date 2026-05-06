import type { WhichKeyKeybindings } from "./types.js";

type ModeWithKeybindings = {
  keybindings?: WhichKeyKeybindings;
};

/**
 * Reads Pi keybindings from InteractiveMode when available.
 *
 * @param mode Interactive mode instance patched by Nexus.
 * @returns Injected keybinding manager, when present.
 */
export function getModeKeybindings(mode: unknown): WhichKeyKeybindings | undefined {
  return (mode as ModeWithKeybindings).keybindings;
}
