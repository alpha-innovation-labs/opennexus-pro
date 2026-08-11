import type { RuntimeSlashCommandFilterConfig } from "./RuntimeSlashCommandFilterConfig";

/**
 * Reports whether a runtime slash command should stay hidden from the Nexus menu.
 *
 * @param name Runtime slash command name without the leading slash.
 * @param config Configurable hidden command names and prefixes.
 * @returns True when the command should not be shown.
 */
export function isHiddenRuntimeSlashCommand(
	name: string,
	config: RuntimeSlashCommandFilterConfig,
): boolean {
	if (config.hiddenNames.includes(name)) return true;
	return config.hiddenNamePrefixes.some((prefix) => name.startsWith(prefix));
}
