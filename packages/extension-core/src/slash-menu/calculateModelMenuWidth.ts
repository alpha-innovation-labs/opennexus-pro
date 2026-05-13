import { visibleWidth } from "@earendil-works/pi-tui";
import { getSlashMenuItemIcon } from "./getSlashMenuItemIcon.js";
import type { SlashMenuLeaf } from "./types.js";

const MODEL_MENU_EXTRA_WIDTH = 8;
const MODEL_MENU_MIN_WIDTH = 36;
const MODEL_MENU_MAX_WIDTH = 132;

/**
 * Calculates the compact modal width required by grouped model rows.
 *
 * @param leaves Model leaves with provider group labels.
 * @returns Outer modal width that fits model labels and borders.
 */
export function calculateModelMenuWidth(leaves: SlashMenuLeaf[]): number {
  const widestRow = leaves.reduce((widest, leaf) => {
    const iconWidth = visibleWidth(getSlashMenuItemIcon(leaf, "model")) + 1;
    const fixedLabelWidth = (leaf as { fixedLabelWidth?: number }).fixedLabelWidth;
    const labelWidth = fixedLabelWidth ?? visibleWidth(leaf.label);
    const descriptionWidth = leaf.description ? visibleWidth(leaf.description) + 1 : 0;
    const modelWidth = iconWidth + labelWidth + descriptionWidth;
    const groupWidth = visibleWidth(leaf.groupLabel ?? "");
    return Math.max(widest, modelWidth, groupWidth);
  }, visibleWidth("Model"));
  return Math.max(MODEL_MENU_MIN_WIDTH, Math.min(MODEL_MENU_MAX_WIDTH, widestRow + MODEL_MENU_EXTRA_WIDTH));
}
