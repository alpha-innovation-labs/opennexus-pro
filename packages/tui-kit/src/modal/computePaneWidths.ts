import type { SharedModalPane } from "./types.js";

/**
 * Computes pane widths from proportional pane sizes.
 *
 * @param panes Panes to lay out.
 * @param contentWidth Width available for pane content and separators.
 * @returns Width for each pane.
 */
export function computePaneWidths(panes: SharedModalPane[], contentWidth: number): number[] {
  if (panes.length === 0) return [];
  const separatorWidth = Math.max(0, panes.length - 1);
  const availableWidth = Math.max(1, contentWidth - separatorWidth);
  const totalSize = panes.reduce((sum, pane) => sum + Math.max(1, pane.size), 0);
  const widths = panes.map((pane) => Math.max(pane.minWidth ?? 1, Math.floor((availableWidth * Math.max(1, pane.size)) / totalSize)));
  const overflow = widths.reduce((sum, width) => sum + width, 0) - availableWidth;

  if (overflow > 0) shrinkPaneWidths(widths, panes, overflow);
  else widths[widths.length - 1] += Math.abs(overflow);

  return widths;
}

/**
 * Shrinks pane widths without going below pane minimum widths.
 *
 * @param widths Mutable pane widths.
 * @param panes Pane definitions.
 * @param overflow Width to remove.
 */
function shrinkPaneWidths(widths: number[], panes: SharedModalPane[], overflow: number): void {
  let remaining = overflow;
  for (let index = widths.length - 1; index >= 0 && remaining > 0; index -= 1) {
    const minimum = panes[index]?.minWidth ?? 1;
    const removable = Math.max(0, widths[index]! - minimum);
    const amount = Math.min(removable, remaining);
    widths[index] -= amount;
    remaining -= amount;
  }
}
