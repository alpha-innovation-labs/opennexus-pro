import { computePaneWidths } from "./computePaneWidths";
import { renderPaneRow } from "./renderPaneRow";
import { renderSharedModalPaneFillerLine, renderSharedModalPaneLines } from "./renderSharedModalPaneLines";
import type { SharedModalPane, SharedModalTheme } from "./types";

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
    rows.push(renderPaneRow(theme, paneLines.map((lines, index) => lines[rowIndex] ?? renderSharedModalPaneFillerLine(theme, panes[index]!, widths[index] ?? 1)), widths));
  }

  return rows;
}

/** Renders extra pane rows for fullscreen padding while preserving pane gutters. */
export function renderModalPaneFillerRows(theme: SharedModalTheme, panes: SharedModalPane[], width: number, count: number): string[] {
  if (count <= 0) return [];
  const widths = computePaneWidths(panes, width);
  const paneLines = panes.map((pane, index) => renderSharedModalPaneFillerLine(theme, pane, widths[index] ?? 1));
  return Array.from({ length: count }, () => renderPaneRow(theme, paneLines, widths));
}
