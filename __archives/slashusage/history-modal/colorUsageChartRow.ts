export const TEAL = "\x1b[38;2;125;214;198m";
export const ORANGE = "\x1b[38;2;230;170;80m";
export const RED = "\x1b[38;2;210;90;90m";
export const RESET = "\x1b[0m";

/**
 * Colors one usage chart row based on the percent threshold it represents.
 *
 * @param row Braille chart row.
 * @param percent Percent value represented by the row.
 * @returns ANSI-colored chart row.
 */
export function colorUsageChartRow(row: string, percent: number): string {
	return `${getUsageChartRowColor(percent)}${row}${RESET}`;
}

/**
 * Returns the chart color for a percentage band.
 *
 * @param percent Percentage represented by a row.
 * @returns ANSI color sequence.
 */
export function getUsageChartRowColor(percent: number): string {
	if (percent >= 66) return RED;
	if (percent >= 33) return ORANGE;
	return TEAL;
}
