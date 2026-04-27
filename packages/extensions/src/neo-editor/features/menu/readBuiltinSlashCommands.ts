import { BUILTIN_SLASH_COMMANDS } from "../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/slash-commands.js";
import type { RegisteredSlashCommand } from "./types.js";

/**
 * Returns the built-in interactive Pi slash commands.
 *
 * @returns Built-in slash commands.
 */
export function readBuiltinSlashCommands(): RegisteredSlashCommand[] {
  return BUILTIN_SLASH_COMMANDS.map((command) => ({
    name: command.name,
    description: command.description,
    source: "builtin",
  }));
}
