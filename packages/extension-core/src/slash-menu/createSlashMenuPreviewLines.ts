import { createLeafPreviewLines } from "./createLeafPreviewLines.js";
import { findTopLevelItem } from "./findTopLevelItem.js";
import { getSettingsRootLeaf } from "./getSettingsRootLeaf.js";
import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import { createResourceCommandPreviewLines } from "./createResourceCommandPreviewLines.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

/**
 * Builds preview text for the currently selected slash-menu item.
 *
 * @param level Current menu level.
 * @param item Selected menu item.
 * @param theme Active UI theme.
 * @returns Preview lines for the right pane.
 */
export function createSlashMenuPreviewLines(level: SlashMenuLevel, item: SlashMenuLeaf | SlashMenuSection, theme: SharedModalTheme): string[] {
  if (level === "resume") return ["Loading transcript..."];
  if (level === "prompts" || level === "skills") return createResourceCommandPreviewLines(item, theme);
  if (item.value === "settings") return createLeafPreviewLines(getSettingsRootLeaf());
  const leaf = findTopLevelItem(item.value) as SlashMenuLeaf | undefined;
  return createLeafPreviewLines((leaf ?? item) as SlashMenuLeaf);
}
