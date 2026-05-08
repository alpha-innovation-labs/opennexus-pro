import type { SlashMenuLevel } from "./SlashMenuLevel.js";

/**
 * Decides whether a slash-menu level should render the preview pane.
 *
 * @param level Current slash-menu level.
 * @returns True when the level needs a right preview pane.
 */
export function shouldShowSlashMenuPreview(level: SlashMenuLevel): boolean {
  return level === "resume" || level === "prompts" || level === "skills";
}
