/**
 * Computes the sticky top offset that centers the terminal within the usable viewport.
 *
 * @param viewportHeight Current viewport height.
 * @param terminalHeight Rendered terminal figure height.
 * @param navHeight Height reserved by the sticky site navigation.
 * @returns Sticky top offset in pixels.
 */
export function getShowcaseTerminalStickyTop(
	viewportHeight: number,
	terminalHeight: number,
	navHeight: number,
): number {
	const availableViewportTop = navHeight;
	const availableViewportHeight = Math.max(0, viewportHeight - navHeight);
	const centeredTop =
		availableViewportTop + availableViewportHeight / 2 - terminalHeight / 2;

	return Math.max(navHeight, Math.round(centeredTop));
}
