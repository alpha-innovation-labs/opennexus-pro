import { formatShortcut } from "@nexus/tui-kit/shortcuts/index.js";
import type { WhichKeyExtensionShortcut, WhichKeyGroup } from "./types.js";

/**
 * Converts extension shortcut registrations into a which-key group.
 *
 * @param shortcuts Extension shortcuts.
 * @returns Extension shortcut group, when any shortcuts exist.
 */
export function toWhichKeyExtensionGroup(shortcuts: WhichKeyExtensionShortcut[]): WhichKeyGroup | undefined {
  if (shortcuts.length === 0) return undefined;
  return {
    title: "Extensions",
    shortcuts: shortcuts.map((shortcut) => ({
      label: shortcut.description ?? shortcut.extensionPath ?? shortcut.shortcut,
      keys: formatShortcut(shortcut.shortcut),
    })),
  };
}
