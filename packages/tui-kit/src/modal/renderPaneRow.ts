import { padModalLine } from "./padModalLine";
import type { SharedModalTheme } from "./types";

/**
 * Renders one row across all modal panes.
 *
 * @param theme Theme color helpers.
 * @param paneLines Content for each pane at the row.
 * @param widths Width for each pane.
 * @returns Rendered pane row.
 */
export function renderPaneRow(theme: SharedModalTheme, paneLines: string[], widths: number[]): string {
  const cells = paneLines.map((line, index) => padModalLine(line, widths[index] ?? 1));
  return `${theme.fg("borderMuted", "│")}${cells.join(theme.fg("borderMuted", "│"))}${theme.fg("borderMuted", "│")}`;
}
