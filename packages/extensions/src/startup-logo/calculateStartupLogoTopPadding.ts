const RESERVED_LINES_BEFORE_STARTUP_WIDGET = 2;

/**
 * Calculates blank lines needed above the startup logo to center the first prompt.
 *
 * @param terminalRows Current terminal row count.
 * @param logoLineCount Number of rendered logo lines.
 * @returns Number of blank lines to render before the logo.
 */
export function calculateStartupLogoTopPadding(terminalRows: number, logoLineCount: number): number {
	const targetLinesBeforeEditor = Math.max(0, Math.floor(terminalRows / 2) - 1);
	return Math.max(0, targetLinesBeforeEditor - logoLineCount - RESERVED_LINES_BEFORE_STARTUP_WIDGET);
}
