import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types";
import { defaultRuntimeSlashCommandFilterConfig } from "./filters/defaultRuntimeSlashCommandFilterConfig";
import { filterVisibleRuntimeSlashCommands } from "./filters/filterVisibleRuntimeSlashCommands";
import { isHiddenRuntimeSlashCommand } from "./filters/isHiddenRuntimeSlashCommand";
import { getRegisteredSlashCommands } from "./registerSlashCommand";
import { getSlashCommandMenuGroup } from "./getSlashCommandMenuGroup";
import { normalizeBuiltinCommandDescription } from "./normalizeBuiltinCommandDescription";
import { readBuiltinSlashCommands } from "./readBuiltinSlashCommands";

/**
 * Builds slash-menu command entries.
 *
 * @param dynamicCommands Live commands reported by Pi's runtime.
 * @returns Command leaf entries.
 */
export function createCommandLeaves(dynamicCommands: RegisteredSlashCommand[] = []): SlashMenuLeaf[] {
  const extensionCommands = filterVisibleRuntimeSlashCommands(dynamicCommands);
  const commands = [...readBuiltinSlashCommands(), ...getRegisteredSlashCommands(), ...extensionCommands];
  const deduped = new Map(commands.map((command) => [command.name, command]));
  return [...deduped.values()]
    .filter((command) => !["changelog", "fff-features", "quit", "scoped-models", "settings"].includes(command.name) && command.hidden !== true)
    .filter((command) => !isHiddenRuntimeSlashCommand(command.name, defaultRuntimeSlashCommandFilterConfig))
    .map((command) => ({
      kind: "command",
      label: command.name,
      description: normalizeBuiltinCommandDescription(command.name, command.description) ?? "No description",
      groupLabel: getSlashCommandMenuGroup(command),
      value: command.name,
    }));
}
