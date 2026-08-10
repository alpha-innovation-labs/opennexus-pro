import type { RegisteredSlashCommand, SlashMenuLeaf } from "./types";

/** Skill prefix used to fuse skill commands into the top-level menu. */
const SKILL_PREFIX = "skill:";

/**
 * Builds top-level resource submenu entries for prompt and skill commands.
 *
 * When there are skill commands, this creates fused top-level leaves with
 * `value: "skill:<name>"` so that typing `/sk` on the promptline immediately
 * surfaces matching skills without navigating into a "skills" submenu.
 *
 * @param commands Live slash commands.
 * @returns Prompt and skill resource submenu entries (skills are fused as leaves).
 */
export function createDynamicCommandItems(commands: RegisteredSlashCommand[]): Array<SlashMenuSection | SlashMenuLeaf> {
  const items: Array<SlashMenuSection | SlashMenuLeaf> = [];
  if (commands.some((command) => command.source === "prompt")) {
    items.push({
      label: "custom commands",
      description: "Run prompt templates.",
      groupLabel: "Resources",
      value: "prompts",
    });
  }
  const skillCommands = commands.filter((command) => command.source === "skill");
  if (skillCommands.length > 0) {
    // Fuse skill commands as top-level leaves with `skill:<name>` values.
    // The "skills" section is still created for navigation when no query is present,
    // but when the user types text that matches "skills", the fused leaves take priority.
    for (const command of skillCommands.sort((a, b) => a.name.localeCompare(b.name))) {
      if (command.hidden) continue;
      // Strip "skill:" prefix from the name to avoid double-prefixing.
      const baseName = command.name.startsWith("skill:") ? command.name.slice(6) : command.name;
      items.push({
        kind: "command" as const,
        label: baseName,
        description: command.description ?? "No description",
        groupLabel: "Skills",
        value: `${SKILL_PREFIX}${baseName}`,
        sourcePath: command.sourceInfo?.path,
        sourceScope: command.sourceInfo?.scope,
      });
    }
    // Keep the "skills" section for navigation when query is empty.
    items.push({
      label: "skills",
      description: "Run skill commands.",
      groupLabel: "Resources",
      value: "skills",
    });
  }
  return items;
}

/**
 * Checks whether a top-level item value is a fused skill command.
 *
 * @param value Item value to check.
 * @returns True when the value is a fused skill.
 */
export function isFusedSkillValue(value: string): boolean {
  return value.startsWith(SKILL_PREFIX);
}

/**
 * Extracts the skill name from a fused skill value.
 *
 * @param value Fused skill value (e.g. `skill:deep-research`).
 * @returns Skill name, or empty string when not a fused skill.
 */
export function extractSkillName(value: string): string {
  if (!isFusedSkillValue(value)) return "";
  return value.slice(SKILL_PREFIX.length);
}
