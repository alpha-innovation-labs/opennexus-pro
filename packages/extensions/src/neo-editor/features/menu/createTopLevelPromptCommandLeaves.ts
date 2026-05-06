import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types.js";

/**
 * Builds top-level leaves for custom prompt commands.
 *
 * @param commands Live slash commands.
 * @returns Visible prompt command leaves grouped under Custom Commands.
 */
export function createTopLevelPromptCommandLeaves(commands: RegisteredSlashCommand[]): SlashMenuLeaf[] {
  return commands
    .filter((command) => command.source === "prompt" && command.hidden !== true)
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }))
    .map((command) => ({
      kind: "command",
      label: command.name,
      description: command.description ?? "No description",
      groupLabel: "Custom Commands",
      sourcePath: command.sourceInfo?.path,
      sourceScope: command.sourceInfo?.scope,
      value: command.name,
    }));
}
