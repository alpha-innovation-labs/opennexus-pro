/**
 * Checks whether a slash command name is a skill command.
 *
 * @param commandName Slash command name without leading slash.
 * @returns True when the command represents skill usage.
 */
export function isSkillCommandName(commandName: string): boolean {
  return commandName === "skills" || commandName.startsWith("skill:");
}
