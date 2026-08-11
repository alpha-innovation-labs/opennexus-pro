export type RightPaneLinesResult = {
	lines: string[];
	rightScrollOffset: number;
};

/**
 * Slices right-pane preview lines for the visible scroll offset.
 *
 * @param rightLines Full right-pane lines.
 * @param height Visible height.
 * @param rightScrollOffset Current scroll offset.
 * @returns Visible lines and clamped offset.
 */
export function createRightPaneLines(
	rightLines: string[],
	height: number,
	rightScrollOffset: number,
): RightPaneLinesResult {
	const maxOffset = Math.max(0, rightLines.length - height);
	const clampedOffset = Math.max(0, Math.min(maxOffset, rightScrollOffset));
	return {
		lines: rightLines.slice(clampedOffset, clampedOffset + height),
		rightScrollOffset: clampedOffset,
	};
}
