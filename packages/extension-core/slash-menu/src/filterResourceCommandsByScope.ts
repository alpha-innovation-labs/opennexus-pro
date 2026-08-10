import type { ResourceCommandScope } from "./ResourceCommandScope.js";
import { getResourceCommandScope } from "./getResourceCommandScope.js";
import type { RegisteredSlashCommand } from "./types.js";

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
  return commands.filter((command) => getResourceCommandScope(command) === scope);
}
