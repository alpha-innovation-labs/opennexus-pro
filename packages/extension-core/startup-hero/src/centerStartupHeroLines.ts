import { visibleWidth } from "@earendil-works/pi-tui";

/**
 * Centers every startup hero line and pads it to the full terminal width.
 *
 * @param lines Hero lines, possibly with ANSI styling.
 * @param terminalColumns Current terminal column count.
 * @returns Full-width horizontally centered hero lines.
 */
export function centerStartupHeroLines(
	lines: string[],
	terminalColumns: number,
): string[] {
	return lines.map((line) => {
		const lineWidth = visibleWidth(line);
		const totalPadding = Math.max(0, terminalColumns - lineWidth);
		const leftPadding = " ".repeat(Math.floor(totalPadding / 2));
		const rightPadding = " ".repeat(Math.ceil(totalPadding / 2));
		return `${leftPadding}${line}${rightPadding}`;
	});
}
