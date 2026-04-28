import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { RegisteredSlashCommand } from "./types.js";

/**
 * Reads slash commands exposed by the live Pi runtime.
 *
 * @param getCommands Runtime command reader.
 * @returns Commands normalized for the Nexus slash menu.
 */
export function getDynamicSlashCommands(getCommands: ExtensionAPI["getCommands"]): RegisteredSlashCommand[] {
  return getCommands().map((command) => ({
    name: command.name,
    description: command.description,
    source: command.source,
    sourceInfo: command.sourceInfo,
  }));
}
