import { truncateToWidth } from "@earendil-works/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";

/**
 * Renders Nexus session info rows with lightweight section styling.
 *
 * @param rows Plain session info rows.
 * @param width Available row width.
 * @param theme UI theme.
 * @returns Styled rows.
 */
export function renderSessionInfoRows(rows: string[], width: number, theme: SelectPreviewTheme): string[] {
  return rows.map((row) => {
    if (!row) return "";
    if (row === "Counts") return theme.fg("accent", theme.bold(row));
    const [label, ...rest] = row.split(": ");
    if (rest.length === 0) return truncateToWidth(row, width, "…");
    return `${theme.fg("muted", `${label}:`)} ${truncateToWidth(rest.join(": "), Math.max(1, width - label.length - 2), "…")}`;
  });
}
