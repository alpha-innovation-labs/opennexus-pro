import { buildStartupLogoLines } from "./buildStartupLogoLines.js";
import { calculateStartupLogoTopPadding } from "./calculateStartupLogoTopPadding.js";
import { centerStartupLogoLine } from "./centerStartupLogoLine.js";

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
	const logoLines = buildStartupLogoLines(theme).map((line) => centerStartupLogoLine(line, terminalColumns));
	return [...Array.from({ length: calculateStartupLogoTopPadding(terminalRows, logoLines.length) }, () => ""), ...logoLines];
}
