import { getRegisteredSlashCommands } from "./registerSlashCommand";

/**
 * Finds one registered slash command by name.
 *
 * @param name Command name.
 * @returns Registered command, if found.
 */
export function findRegisteredCommand(name: string) {
  return getRegisteredSlashCommands().find((command) => command.name === name);
}
