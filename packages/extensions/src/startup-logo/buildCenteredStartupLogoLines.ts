import { buildStartupLogoLines } from "./buildStartupLogoLines.js";
import { calculateStartupLogoTopPadding } from "./calculateStartupLogoTopPadding.js";
import { centerStartupLogoLines } from "./centerStartupLogoLines.js";

const STARTUP_LOGO_BOTTOM_PADDING_LINES = 1;

/**
 * Builds startup logo lines with vertical padding that centers the first prompt.
 *
 * @param theme UI theme formatter.
 * @param terminalRows Current terminal row count.
 * @param terminalColumns Current terminal column count.
 * @returns Padded and centered startup logo lines.
 */
export function buildCenteredStartupLogoLines(
	theme: { fg(name: string, value: string): string },
	terminalRows: number,
	terminalColumns: number,
): string[] {
	const logoLines = centerStartupLogoLines(buildStartupLogoLines(theme), terminalColumns);
	const bottomPaddingLines = Array.from({ length: STARTUP_LOGO_BOTTOM_PADDING_LINES }, () => "");
	const topPaddingLineCount = calculateStartupLogoTopPadding(terminalRows, logoLines.length + bottomPaddingLines.length);
	return [...Array.from({ length: topPaddingLineCount }, () => ""), ...logoLines, ...bottomPaddingLines];
}
