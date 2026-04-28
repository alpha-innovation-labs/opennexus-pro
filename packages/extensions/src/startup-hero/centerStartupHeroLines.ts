import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Adds equal left padding to every startup hero line so the hero block stays aligned.
 *
 * @param lines Hero lines, possibly with ANSI styling.
 * @param terminalColumns Current terminal column count.
 * @returns Horizontally centered hero block.
 */
export function centerStartupHeroLines(lines: string[], terminalColumns: number): string[] {
	const heroWidth = Math.max(0, ...lines.map((line) => visibleWidth(line)));
	const leftPadding = " ".repeat(Math.max(0, Math.floor((terminalColumns - heroWidth) / 2)));
	return lines.map((line) => `${leftPadding}${line}`);
}
