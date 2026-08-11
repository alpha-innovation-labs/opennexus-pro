import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";

/**
 * Renders a modal-themed horizontal divider inside the Tetris body.
 *
 * @param theme Active UI theme.
 * @param width Divider width.
 * @returns Divider line.
 */
export function createTetrisDividerLine(
	theme: SharedModalTheme,
	width: number,
): string {
	return theme.fg("borderMuted", "─".repeat(Math.max(1, width)));
}
