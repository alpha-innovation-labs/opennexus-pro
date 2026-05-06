import { createWhichKeyGroupMap } from "./createWhichKeyGroupMap.js";
import { formatKeyList } from "./formatKeyList.js";
import { getRegisteredWhichKeyShortcuts } from "./getRegisteredWhichKeyShortcuts.js";
import { getResolvedWhichKeyBindings } from "./getResolvedWhichKeyBindings.js";
import { getStaticWhichKeyGroups } from "./getStaticWhichKeyGroups.js";
import { getWhichKeyGroupTitle } from "./getWhichKeyGroupTitle.js";
import { toKeyList } from "./toKeyList.js";
import { toWhichKeyExtensionGroup } from "./toWhichKeyExtensionGroup.js";
import type { WhichKeyExtensionShortcut, WhichKeyGroup, WhichKeyKeybindings } from "./types.js";

const GROUP_ORDER = ["Nexus Triggers", "Input", "Editor", "Application", "Models & Thinking", "Tools", "Messages", "Clipboard", "Selection", "Sessions", "Session Tree", "Scoped Models"];

/**
 * Builds exhaustive which-key groups from Pi keybindings and extension shortcuts.
 *
 * @param keybindings Injected Pi keybinding manager.
 * @param extensionShortcuts Optional filtered extension shortcuts from Pi's extension runner.
 * @returns Which-key shortcut groups.
 */
export function getWhichKeyGroups(keybindings: WhichKeyKeybindings, extensionShortcuts: WhichKeyExtensionShortcut[] = getRegisteredWhichKeyShortcuts()): WhichKeyGroup[] {
  const groups = createWhichKeyGroupMap(GROUP_ORDER);
  for (const group of getStaticWhichKeyGroups()) groups.set(group.title, group);

  for (const [keybinding, value] of Object.entries(getResolvedWhichKeyBindings(keybindings))) {
    const keys = toKeyList(value);
    if (keys.length === 0) continue;
    const title = getWhichKeyGroupTitle(keybinding);
    const group = groups.get(title) ?? { title, shortcuts: [] };
    group.shortcuts.push({
      label: keybindings.getDefinition?.(keybinding)?.description ?? keybinding,
      keys: formatKeyList(keys),
    });
    groups.set(title, group);
  }

  const extensionGroup = toWhichKeyExtensionGroup(extensionShortcuts);
  if (extensionGroup) groups.set(extensionGroup.title, extensionGroup);

  return Array.from(groups.values()).filter((group) => group.shortcuts.length > 0);
}
