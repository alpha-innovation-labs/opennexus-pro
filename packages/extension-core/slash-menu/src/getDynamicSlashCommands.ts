import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { filterVisibleRuntimeSlashCommands } from "./filters/filterVisibleRuntimeSlashCommands";
import type { RegisteredSlashCommand } from "./types";

/**
 * Reads slash commands exposed by the live Pi runtime.
 *
 * @param getCommands Runtime command reader.
 * @returns Commands normalized for the Nexus slash menu.
 */
export function getDynamicSlashCommands(getCommands: ExtensionAPI["getCommands"]): RegisteredSlashCommand[] {
  const commands = getCommands().map((command) => ({
    name: command.name,
    description: command.description,
    source: command.source,
    sourceInfo: command.sourceInfo,
  }));
  return [
    ...filterVisibleRuntimeSlashCommands(commands.filter((command) => command.source === "extension")),
    ...commands.filter((command) => command.source !== "extension"),
  ];
}
