import { getResourceCommandScope } from "./getResourceCommandScope";
import type { ResourceCommandScope } from "./ResourceCommandScope";
import type { RegisteredSlashCommand } from "./types";

/**
 * Filters prompt or skill commands by local/global scope.
 *
 * @param commands Commands to filter.
 * @param scope Active scope filter.
 * @returns Commands matching the selected scope.
 */
export function filterResourceCommandsByScope(
	commands: RegisteredSlashCommand[],
	scope: ResourceCommandScope,
): RegisteredSlashCommand[] {
	if (scope === "all") return commands;
	return commands.filter(
		(command) => getResourceCommandScope(command) === scope,
	);
}
