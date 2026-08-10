import { createHotkeysGroupMap } from "./createHotkeysGroupMap";
import { formatKeyList } from "./formatKeyList";
import { getRegisteredHotkeysShortcuts } from "./getRegisteredHotkeysShortcuts";
import { getResolvedHotkeysBindings } from "./getResolvedHotkeysBindings";
import { getStaticHotkeysGroups } from "./getStaticHotkeysGroups";
import { getHotkeysGroupTitle } from "./getHotkeysGroupTitle";
import { toKeyList } from "./toKeyList";
import { toHotkeysExtensionGroup } from "./toHotkeysExtensionGroup";
import type { HotkeysExtensionShortcut, HotkeysGroup, HotkeysKeybindings } from "./types";

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
