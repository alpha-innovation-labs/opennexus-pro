import { padModalLine } from "./padModalLine.js";
import type { SharedModalTheme } from "./types.js";

/**
 * Renders full-width header or footer rows inside the modal frame.
 *
 * @param theme Theme color helpers.
 * @param rows Rows to render.
 * @param width Inner modal width.
 * @returns Rendered modal rows.
 */
export function renderFullWidthRows(theme: SharedModalTheme, rows: string[], width: number): string[] {
  return rows.map((row) => `${theme.fg("borderMuted", "│")}${padModalLine(row, width)}${theme.fg("borderMuted", "│")}`);
}
