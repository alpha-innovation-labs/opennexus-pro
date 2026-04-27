const TEAL = "\x1b[38;2;125;214;198m";
const ORANGE = "\x1b[38;2;230;170;80m";
const RED = "\x1b[38;2;210;90;90m";

/**
 * Resolves the ANSI icon color for a used percentage.
 *
 * @param value Used percentage.
 * @returns ANSI color code.
 */
export function getUsageIconColor(value: number | undefined): string {
	if (typeof value !== "number" || !Number.isFinite(value)) return TEAL;
	if (value >= 66.67) return RED;
	if (value >= 33.33) return ORANGE;
	return TEAL;
}
