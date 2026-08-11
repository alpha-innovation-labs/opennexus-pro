/**
 * Calculates the visible body height for two-pane modal content.
 *
 * @returns Visible body height.
 */
export function getTwoPaneBodyHeight(fullScreen = false): number {
	const terminalRows = process.stdout.rows ?? 30;
	return fullScreen
		? Math.max(12, terminalRows - 4)
		: Math.max(12, Math.floor(terminalRows * 0.8) - 4);
}
