import type { RegisteredSlashCommand } from "./types.js";

/**
 * Returns the built-in interactive Pi slash commands.
 * BUILTIN_SLASH_COMMANDS is not exported from the package — returns empty array.
 *
 * @returns Built-in slash commands (empty, since the symbol is not exported).
 */
export function readBuiltinSlashCommands(): RegisteredSlashCommand[] {
  // BUILTIN_SLASH_COMMANDS is not accessible via the public API.
  return [];
}
