const RESERVED_LINES_BEFORE_STARTUP_WIDGET = 2;

/**
 * Calculates blank lines needed above the startup hero to center the first prompt.
 *
 * @param terminalRows Current terminal row count.
 * @param heroLineCount Number of rendered hero lines.
 * @returns Number of blank lines to render before the hero.
 */
export function calculateStartupHeroTopPadding(terminalRows: number, heroLineCount: number): number {
	const targetLinesBeforeEditor = Math.max(0, Math.floor(terminalRows / 2) - 1);
	return Math.max(0, targetLinesBeforeEditor - heroLineCount - RESERVED_LINES_BEFORE_STARTUP_WIDGET);
}
