import type { SharedModalTheme } from "@nexus/tui-kit/modal/types";

/**
 * Renders the compact Tetris hotkey help line.
 *
 * @param theme Active UI theme.
 * @returns One help line.
 */
export function renderTetrisHelpLine(
	theme: SharedModalTheme & { bold: (text: string) => string },
): string {
	return theme.fg(
		"dim",
		"Esc/Ctrl+C hides · ←→ move · ↑ rotate · ↓ soft drop · Space hard drop · p pause · r restart · m music",
	);
}
