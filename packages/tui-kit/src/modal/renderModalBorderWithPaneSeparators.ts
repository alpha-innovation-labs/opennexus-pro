import { computePaneWidths } from "./computePaneWidths";
import { renderModalBorder } from "./renderModalBorder";
import type { SharedModalPane, SharedModalTheme } from "./types";

/**
 * Renders a modal border row with pane separators connected to body dividers.
 *
 * @param theme Modal theme.
 * @param left Left border glyph.
 * @param horizontal Horizontal border glyph.
 * @param separator Pane separator glyph.
 * @param right Right border glyph.
 * @param innerWidth Inner modal width.
 * @param panes Modal panes.
 * @returns Border row with pane separator junctions.
 */
export function renderModalBorderWithPaneSeparators(
	theme: SharedModalTheme,
	left: string,
	horizontal: string,
	separator: string,
	right: string,
	innerWidth: number,
	panes: SharedModalPane[],
): string {
	if (panes.length <= 1)
		return renderModalBorder(theme, left, horizontal, right, innerWidth);
	const widths = computePaneWidths(panes, innerWidth);
	const body = widths
		.map((paneWidth) => horizontal.repeat(paneWidth))
		.join(separator);
	return theme.fg("borderMuted", `${left}${body}${right}`);
}
