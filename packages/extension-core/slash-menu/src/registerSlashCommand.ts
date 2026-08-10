import type { RegisteredSlashCommand } from "./types";

const slashCommands = new Map<string, RegisteredSlashCommand>();

/**
 * Records one slash command for the custom slash menu.
 *
 * @param command Slash command metadata.
 */
export function registerSlashCommand(command: RegisteredSlashCommand): void {
  slashCommands.set(command.name, command);
}

/**
 * Clears the recorded slash commands.
 */
export function clearRegisteredSlashCommands(): void {
  slashCommands.clear();
}

/**
 * Returns all recorded slash commands.
 *
 * @returns Recorded commands.
 */
export function getRegisteredSlashCommands(): RegisteredSlashCommand[] {
  return [...slashCommands.values()].sort((left, right) => left.name.localeCompare(right.name));
}
