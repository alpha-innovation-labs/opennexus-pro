import type { RegisteredSlashCommand } from "../types.js";
import { defaultRuntimeSlashCommandFilterConfig } from "./defaultRuntimeSlashCommandFilterConfig.js";
import type { RuntimeSlashCommandFilterConfig } from "./RuntimeSlashCommandFilterConfig.js";
import { isHiddenRuntimeSlashCommand } from "./isHiddenRuntimeSlashCommand.js";

/**
 * Filters runtime extension commands to those visible in the Nexus slash menu.
 *
 * @param commands Runtime slash commands reported by Pi.
 * @param config Configurable hidden command names and prefixes.
 * @returns Visible runtime extension slash commands.
 */
export function filterVisibleRuntimeSlashCommands(
  commands: RegisteredSlashCommand[],
  config: RuntimeSlashCommandFilterConfig = defaultRuntimeSlashCommandFilterConfig,
): RegisteredSlashCommand[] {
  return commands.filter((command) => command.source === "extension" && !isHiddenRuntimeSlashCommand(command.name, config));
}
