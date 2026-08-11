import type { RegisteredSlashCommand } from "../types";
import { defaultRuntimeSlashCommandFilterConfig } from "./defaultRuntimeSlashCommandFilterConfig";
import { isHiddenRuntimeSlashCommand } from "./isHiddenRuntimeSlashCommand";
import type { RuntimeSlashCommandFilterConfig } from "./RuntimeSlashCommandFilterConfig";

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
	return commands.filter(
		(command) =>
			command.source === "extension" &&
			!isHiddenRuntimeSlashCommand(command.name, config),
	);
}
