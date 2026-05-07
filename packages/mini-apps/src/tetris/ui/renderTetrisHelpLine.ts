/**
 * Renders the compact Tetris hotkey help line.
 *
 * @param theme Active UI theme.
 * @returns One help line.
 */
export function renderTetrisHelpLine(theme: any): string {
	return theme.fg("dim", "Esc/Ctrl+C hides · ←→ move · ↑ rotate · ↓ soft drop · Space hard drop · p pause · r restart · m music");
}
