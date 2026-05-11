import { createSourceCommandLeaves } from "./createSourceCommandLeaves.js";
import type { RegisteredSlashCommand, SlashMenuSection } from "./types.js";

/**
 * Builds top-level resource submenu entries for prompt and skill commands.
 *
 * @param commands Live slash commands.
 * @returns Prompt and skill resource submenu entries.
 */
export function createDynamicCommandItems(commands: RegisteredSlashCommand[]): SlashMenuSection[] {
  const items: SlashMenuSection[] = [];
  if (commands.some((command) => command.source === "prompt")) {
    items.push({
      label: "custom commands",
      description: "Run prompt templates.",
      groupLabel: "Resources",
      value: "prompts",
    });
  }
  if (commands.some((command) => command.source === "skill")) {
    items.push({
      label: "skills",
      description: "Run skill commands.",
      groupLabel: "Resources",
      value: "skills",
    });
  }
  return items;
}
