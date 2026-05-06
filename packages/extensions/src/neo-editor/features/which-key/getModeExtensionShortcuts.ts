import type { WhichKeyExtensionShortcut, WhichKeyKeybindings } from "./types.js";

type ModeWithShortcuts = {
  session?: {
    extensionRunner?: {
      getShortcuts?: (resolvedKeybindings: Record<string, string | string[] | undefined>) => Map<string, WhichKeyExtensionShortcut>;
    };
  };
};

/**
 * Reads Pi-filtered extension shortcuts from InteractiveMode when available.
 *
 * @param mode Interactive mode instance patched by Nexus.
 * @param keybindings Injected Pi keybinding manager.
 * @returns Filtered extension shortcuts.
 */
export function getModeExtensionShortcuts(mode: unknown, keybindings: WhichKeyKeybindings): WhichKeyExtensionShortcut[] {
  const runner = (mode as ModeWithShortcuts).session?.extensionRunner;
  const resolved = keybindings.getEffectiveConfig?.() ?? keybindings.getResolvedBindings?.() ?? {};
  return Array.from(runner?.getShortcuts?.(resolved).values() ?? []);
}
