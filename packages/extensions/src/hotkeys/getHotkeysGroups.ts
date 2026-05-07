import { createHotkeysGroupMap } from "./createHotkeysGroupMap.js";
import { formatKeyList } from "./formatKeyList.js";
import { getRegisteredHotkeysShortcuts } from "./getRegisteredHotkeysShortcuts.js";
import { getResolvedHotkeysBindings } from "./getResolvedHotkeysBindings.js";
import { getStaticHotkeysGroups } from "./getStaticHotkeysGroups.js";
import { getHotkeysGroupTitle } from "./getHotkeysGroupTitle.js";
import { toKeyList } from "./toKeyList.js";
import { toHotkeysExtensionGroup } from "./toHotkeysExtensionGroup.js";
import type { HotkeysExtensionShortcut, HotkeysGroup, HotkeysKeybindings } from "./types.js";

const GROUP_ORDER = ["Nexus Triggers", "Input", "Editor", "Application", "Models & Thinking", "Tools", "Messages", "Clipboard", "Selection", "Sessions", "Session Tree", "Scoped Models"];

/**
 * Builds exhaustive hotkeys groups from Pi keybindings and extension shortcuts.
 *
 * @param keybindings Injected Pi keybinding manager.
 * @param extensionShortcuts Optional filtered extension shortcuts from Pi's extension runner.
 * @returns Which-key shortcut groups.
 */
export function getHotkeysGroups(keybindings: HotkeysKeybindings, extensionShortcuts: HotkeysExtensionShortcut[] = getRegisteredHotkeysShortcuts()): HotkeysGroup[] {
  const groups = createHotkeysGroupMap(GROUP_ORDER);
  for (const group of getStaticHotkeysGroups()) groups.set(group.title, group);

  for (const [keybinding, value] of Object.entries(getResolvedHotkeysBindings(keybindings))) {
    const keys = toKeyList(value);
    if (keys.length === 0) continue;
    const title = getHotkeysGroupTitle(keybinding);
    const group = groups.get(title) ?? { title, shortcuts: [] };
    group.shortcuts.push({
      label: keybindings.getDefinition?.(keybinding)?.description ?? keybinding,
      keys: formatKeyList(keys),
      keybindingId: keybinding,
    });
    groups.set(title, group);
  }

  const extensionGroup = toHotkeysExtensionGroup(extensionShortcuts);
  if (extensionGroup) groups.set(extensionGroup.title, extensionGroup);

  return Array.from(groups.values()).filter((group) => group.shortcuts.length > 0);
}
