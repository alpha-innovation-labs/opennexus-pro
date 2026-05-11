import { visibleWidth } from "@earendil-works/pi-tui";
import type { SharedModalTheme } from "../types.js";

/**
 * Wraps hotkey footer segments without splitting individual hotkey hints.
 *
 * @param theme Modal theme used to color separators.
 * @param segments Rendered hotkey segments.
 * @param width Maximum visible width for each row.
 * @returns Wrapped footer rows.
 */
export function wrapModalHotkeyFooterSegments(theme: SharedModalTheme, segments: readonly string[], width: number): string[] {
  const separator = theme.fg("dim", " · ");
  const rows: string[] = [];
  let current = "";

  for (const segment of segments) {
    const candidate = current.length === 0 ? segment : `${current}${separator}${segment}`;
    if (current.length > 0 && visibleWidth(candidate) > width) {
      rows.push(current);
      current = segment;
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) rows.push(current);
  return rows;
}
