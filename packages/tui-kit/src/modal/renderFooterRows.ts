import { SHARED_MODAL_FOOTER_BORDER } from "./SHARED_MODAL_FOOTER_BORDER";
import { renderFullWidthRows } from "./renderFullWidthRows";
import { renderModalBorder } from "./renderModalBorder";
import type { SharedModalTheme } from "./types";

/**
 * Renders footer rows, allowing sentinel rows to become connected modal borders.
 *
 * @param theme Active modal theme.
 * @param rows Footer rows.
 * @param width Inner modal width.
 * @returns Rendered footer rows.
 */
export function renderFooterRows(theme: SharedModalTheme, rows: string[], width: number): string[] {
  return rows.flatMap((row) => row === SHARED_MODAL_FOOTER_BORDER
    ? [renderModalBorder(theme, "├", "─", "┤", width)]
    : renderFullWidthRows(theme, [row], width));
}
