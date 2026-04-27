import type { SlashMenuLeaf } from "./types.js";
import { getRegisteredSlashCommands } from "./registerSlashCommand.js";
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
    .filter((command) => command.name !== "fff-features" && command.hidden !== true)
    .map((command) => ({
      kind: "command",
      label: `/${command.name}`,
      description: command.description ?? "No description",
      value: command.name,
    }));
}
