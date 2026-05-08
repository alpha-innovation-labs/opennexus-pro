import { computePaneWidths } from "./computePaneWidths.js";
import { renderPaneRow } from "./renderPaneRow.js";
import { renderSharedModalPaneLines } from "./renderSharedModalPaneLines.js";
import type { SharedModalPane, SharedModalTheme } from "./types.js";

/**
 * Renders modal panes into framed content rows.
 *
 * @param theme Theme color helpers.
 * @param panes Panes to render.
 * @param width Inner modal width.
 * @returns Rendered pane rows.
 */
export function renderModalPanes(theme: SharedModalTheme, panes: SharedModalPane[], width: number): string[] {
  const widths = computePaneWidths(panes, width);
  const paneLines = panes.map((pane, index) => renderSharedModalPaneLines(theme, pane, widths[index] ?? 1));
  const rowCount = Math.max(1, ...paneLines.map((lines) => lines.length));
  const rows: string[] = [];

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    rows.push(renderPaneRow(theme, paneLines.map((lines) => lines[rowIndex] ?? ""), widths));
  }

  return rows;
}
