import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";

/**
 * Resolves the theme color used by a context usage marker.
 *
 * @param marker Usage marker glyph.
 * @returns Theme color name.
 */
export function getContextUsageMarkerColor(marker: string): string {
  if (marker === "⛝") return "warning";
  if (marker === "⛶") return "success";
  return "accent";
}

/**
 * Colors a context usage marker with the shared modal theme.
 *
 * @param theme Shared modal theme.
 * @param marker Usage marker glyph.
 * @returns Colored marker.
 */
export function colorContextUsageMarker(theme: SharedModalTheme, marker: string): string {
  return theme.fg(getContextUsageMarkerColor(marker), marker);
}
