import type { SlashMenuLevel } from "./SlashMenuLevel.js";

/**
 * Formats the visible title for one slash-menu level.
 *
 * @param level Current slash-menu level.
 * @returns Human-readable level title.
 */
export function getSlashMenuLevelTitle(level: SlashMenuLevel): string {
  if (level === "scoped-models") return "Scoped Models";
  if (level === "setting-choice") return "Settings";
  if (level === "name-input") return "Name";
  return level.charAt(0).toUpperCase() + level.slice(1);
}
