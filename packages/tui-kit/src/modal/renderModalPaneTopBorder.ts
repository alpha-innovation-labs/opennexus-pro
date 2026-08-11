import { computePaneWidths } from "./computePaneWidths";
import { renderModalBorder } from "./renderModalBorder";
import type { SharedModalPane, SharedModalTheme } from "./types";

/**
 * Renders the pane-owned top border below a full-width header.
 *
 * @param theme Modal theme.
 * @param innerWidth Inner modal width.
 * @param panes Modal panes.
 * @returns Pane top border row without header junction overlap.
 */
export function renderModalPaneTopBorder(
	theme: SharedModalTheme,
	innerWidth: number,
	panes: SharedModalPane[],
): string {
	if (panes.length <= 1)
		return renderModalBorder(theme, "├", "─", "┤", innerWidth);
	const widths = computePaneWidths(panes, innerWidth);
	const body = widths.map((paneWidth) => "─".repeat(paneWidth)).join("┬");
	return theme.fg("borderMuted", `│${body}│`);
}
