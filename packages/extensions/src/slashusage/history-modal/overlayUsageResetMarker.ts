const RED = "\x1b[38;2;210;90;90m";
const RESET = "\x1b[0m";

/**
 * Overlays a red reset marker on one plain chart row.
 *
 * @param row Plain chart row with no ANSI escape codes.
 * @param column Reset marker column.
 * @param resumeColor ANSI color to resume after the marker.
 * @returns Chart row with a red reset marker.
 */
export function overlayUsageResetMarker(row: string, column: number | undefined, resumeColor = ""): string {
  if (column === undefined || column < 0 || column >= row.length) return row;
  return `${row.slice(0, column)}${RED}┃${resumeColor}${row.slice(column + 1)}${resumeColor ? RESET : ""}`;
}
