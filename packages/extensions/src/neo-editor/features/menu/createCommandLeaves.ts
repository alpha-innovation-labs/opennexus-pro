import type { SlashMenuLeaf } from "./types.js";
import { getRegisteredSlashCommands } from "./registerSlashCommand.js";
import { getSlashCommandMenuGroup } from "./getSlashCommandMenuGroup.js";
import { normalizeBuiltinCommandDescription } from "./normalizeBuiltinCommandDescription.js";
import { readBuiltinSlashCommands } from "./readBuiltinSlashCommands.js";

/**
 * Builds slash-menu command entries.
 *
 * @returns Command leaf entries.
 */
export function createCommandLeaves(): SlashMenuLeaf[] {
  const commands = [...readBuiltinSlashCommands(), ...getRegisteredSlashCommands()];
  const deduped = new Map(commands.map((command) => [command.name, command]));
  return [...deduped.values()]
    .filter((command) => !["changelog", "fff-features", "quit", "scoped-models", "settings", "tree"].includes(command.name) && command.hidden !== true)
    .map((command) => ({
      kind: "command",
      label: command.name,
      description: normalizeBuiltinCommandDescription(command.name, command.description) ?? "No description",
      groupLabel: getSlashCommandMenuGroup(command),
      value: command.name,
    }));
}
