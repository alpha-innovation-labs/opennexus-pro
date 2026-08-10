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
  const prefix = source === "skill" ? "skill:" : "";
  return commands
    .filter((command) => command.source === source && command.hidden !== true)
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((command) => {
      // Strip the source prefix from the display label.
      const displayName = prefix && command.name.startsWith(prefix)
        ? command.name.slice(prefix.length)
        : command.name;
      return {
        kind: "command",
        label: displayName,
        description: command.description ?? "No description",
        groupLabel: source === "prompt" ? "Custom Commands" : "Skills",
        sourcePath: command.sourceInfo?.path,
        sourceScope: getResourceCommandScope(command) === "local" ? "project" : getResourceCommandScope(command) === "global" ? "user" : command.sourceInfo?.scope,
        value: command.name,
      };
    });
}
