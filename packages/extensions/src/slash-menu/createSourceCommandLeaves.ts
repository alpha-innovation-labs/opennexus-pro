import { getResourceCommandScope } from "./getResourceCommandScope.js";
import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types.js";

/**
 * Builds slash-menu leaves for one dynamic command source.
 *
 * @param commands Live slash commands.
 * @param source Command source to include.
 * @returns Matching command leaves.
 */
export function createSourceCommandLeaves(
  commands: RegisteredSlashCommand[],
  source: "prompt" | "skill",
): SlashMenuLeaf[] {
  return commands
    .filter((command) => command.source === source && command.hidden !== true)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((command) => ({
      kind: "command",
      label: command.name,
      description: command.description ?? "No description",
      groupLabel: source === "prompt" ? "Custom Commands" : "Skills",
      sourcePath: command.sourceInfo?.path,
      sourceScope: getResourceCommandScope(command) === "local" ? "project" : getResourceCommandScope(command) === "global" ? "user" : command.sourceInfo?.scope,
      value: command.name,
    }));
}
