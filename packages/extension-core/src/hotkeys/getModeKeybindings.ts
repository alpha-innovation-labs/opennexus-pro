import type { HotkeysKeybindings } from "./types.js";

type ModeWithKeybindings = {
  keybindings?: HotkeysKeybindings;
};

/**
 * Reads Pi keybindings from InteractiveMode when available.
 *
 * @param mode Interactive mode instance patched by Nexus.
 * @returns Injected keybinding manager, when present.
 */
export function getModeKeybindings(mode: unknown): HotkeysKeybindings | undefined {
  return (mode as ModeWithKeybindings).keybindings;
}
