import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Adds left padding so a startup logo line is centered in the terminal width.
 *
 * @param line Logo line, possibly with ANSI styling.
 * @param terminalColumns Current terminal column count.
 * @returns Horizontally centered line.
 */
export function centerStartupLogoLine(line: string, terminalColumns: number): string {
	const leftPadding = Math.max(0, Math.floor((terminalColumns - visibleWidth(line)) / 2));
	return `${" ".repeat(leftPadding)}${line}`;
}
