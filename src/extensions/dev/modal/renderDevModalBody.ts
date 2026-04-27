import { truncateToWidth } from "@mariozechner/pi-tui";
import type { DevModalTheme, DevModalVariation } from "./types.js";

/**
 * Renders body rows for the selected dev modal variation.
 *
 * @param variation Selected modal variation.
 * @param theme Theme color helpers.
 * @param width Maximum render width.
 * @returns Rendered body rows.
 */
export function renderDevModalBody(variation: DevModalVariation, theme: DevModalTheme, width: number): string[] {
  const rows = [
    "",
    theme.fg("dim", `Variation: ${variation.id}`),
    ...variation.rows.map((row) => `  ${row}`),
    "",
    theme.fg("muted", "Tab / Shift+Tab switches variations · Esc closes"),
  ];

  return rows.map((row) => truncateToWidth(row, width));
}
