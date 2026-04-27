import { createLeafPreviewLines } from "./createLeafPreviewLines.js";
import { findTopLevelItem } from "./findTopLevelItem.js";
import { getSettingsRootLeaf } from "./getSettingsRootLeaf.js";
import type { SlashMenuLevel } from "./SlashMenuLevel.js";
import type { SlashMenuLeaf, SlashMenuSection } from "./types.js";

/**
 * Builds preview text for the currently selected slash-menu item.
 *
 * @param level Current menu level.
 * @param item Selected menu item.
 * @returns Preview lines for the right pane.
 */
export function createSlashMenuPreviewLines(level: SlashMenuLevel, item: SlashMenuLeaf | SlashMenuSection): string[] {
  if (level === "resume") return ["Loading transcript..."];
  if (item.value === "settings") return createLeafPreviewLines(getSettingsRootLeaf());
  const leaf = findTopLevelItem(item.value) as SlashMenuLeaf | undefined;
  return createLeafPreviewLines((leaf ?? item) as SlashMenuLeaf);
}
