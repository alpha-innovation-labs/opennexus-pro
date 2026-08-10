import { visibleWidth } from "@earendil-works/pi-tui";
import { getSlashMenuItemIcon } from "./getSlashMenuItemIcon";
import type { SlashMenuLevel } from "./SlashMenuLevel";
import type { SlashMenuLeaf, SlashMenuSection } from "./types";

const SINGLE_PANE_EXTRA_WIDTH = 8;
const SINGLE_PANE_MIN_WIDTH = 36;
const SINGLE_PANE_MAX_WIDTH = 96;

/**
 * Calculates a compact width for single-pane slash submenus.
 *
 * @param items Menu items to render.
 * @param level Current slash-menu level.
 * @returns Outer modal width that fits menu text and borders.
 */
export function calculateSinglePaneMenuWidth(items: Array<SlashMenuLeaf | SlashMenuSection>, level: SlashMenuLevel): number {
  if (items.length === 0) return SINGLE_PANE_MIN_WIDTH;
  const widestRow = items.reduce((widest, item) => {
    const iconWidth = visibleWidth(getSlashMenuItemIcon(item, level)) + 1;
    const labelWidth = iconWidth + visibleWidth(item.label);
    const descriptionWidth = shouldMeasureDescription(level) && item.description ? labelWidth + 2 + visibleWidth(item.description) : labelWidth;
    const groupWidth = visibleWidth(item.groupLabel ?? "");
    return Math.max(widest, labelWidth, descriptionWidth, groupWidth);
  }, visibleWidth(level));
  return Math.max(SINGLE_PANE_MIN_WIDTH, Math.min(SINGLE_PANE_MAX_WIDTH, widestRow + SINGLE_PANE_EXTRA_WIDTH));
}

/**
 * Decides whether a level renders item descriptions in the single pane.
 *
 * @param level Current slash-menu level.
 * @returns True when descriptions are visible.
 */
function shouldMeasureDescription(level: SlashMenuLevel): boolean {
  return level === "fork" || level === "tools";
}
