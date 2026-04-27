import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Adds equal left padding to every startup logo line so the logo block stays aligned.
 *
 * @param lines Logo lines, possibly with ANSI styling.
 * @param terminalColumns Current terminal column count.
 * @returns Horizontally centered logo block.
 */
export function centerStartupLogoLines(lines: string[], terminalColumns: number): string[] {
	const logoWidth = Math.max(0, ...lines.map((line) => visibleWidth(line)));
	const leftPadding = " ".repeat(Math.max(0, Math.floor((terminalColumns - logoWidth) / 2)));
	return lines.map((line) => `${leftPadding}${line}`);
}
