import { visibleWidth } from "@earendil-works/pi-tui";
import { TOP_LEVEL_DESCRIPTION_COLUMN } from "./formatTopLevelMenuLabel";
import { getSlashMenuItemIcon } from "./getSlashMenuItemIcon";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

const TOP_LEVEL_EXTRA_WIDTH = 6;
const TOP_LEVEL_MIN_WIDTH = 36;
const TOP_LEVEL_MAX_WIDTH = 96;

/**
 * Calculates a compact width for the top-level slash menu list.
 *
 * @param items Top-level menu items.
 * @returns Outer modal width that fits the rendered list rows.
 */
export function calculateTopLevelMenuWidth(items: Array<SlashMenuLeaf | SlashMenuSection>): number {
  const widestRow = items.reduce((widest, item) => {
    const iconWidth = visibleWidth(getSlashMenuItemIcon(item, "top")) + 1;
    const descriptionWidth = visibleWidth(item.description ?? "");
    const rowWidth = TOP_LEVEL_DESCRIPTION_COLUMN + iconWidth + descriptionWidth;
    return Math.max(widest, rowWidth);
  }, visibleWidth("Menu"));
  return Math.max(TOP_LEVEL_MIN_WIDTH, Math.min(TOP_LEVEL_MAX_WIDTH, widestRow + TOP_LEVEL_EXTRA_WIDTH));
}
