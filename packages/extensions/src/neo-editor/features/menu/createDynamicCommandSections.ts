import { createSourceCommandLeaves } from "./createSourceCommandLeaves.js";
import type { RegisteredSlashCommand, SlashMenuSection } from "./types.js";

/**
 * Builds top-level sections for dynamic prompt and skill commands.
 *
 * @param commands Live slash commands.
 * @returns Top-level prompt and skill sections with available commands.
 */
export function createDynamicCommandSections(commands: RegisteredSlashCommand[]): SlashMenuSection[] {
  const sections: SlashMenuSection[] = [];
  if (createSourceCommandLeaves(commands, "prompt").length > 0) {
    sections.push({
      label: "prompts",
      description: "Run prompt templates.",
      groupLabel: "Resources",
      value: "prompts",
    });
  }
  if (createSourceCommandLeaves(commands, "skill").length > 0) {
    sections.push({
      label: "skills",
      description: "Run skill commands.",
      groupLabel: "Resources",
      value: "skills",
    });
  }
  return sections;
}
