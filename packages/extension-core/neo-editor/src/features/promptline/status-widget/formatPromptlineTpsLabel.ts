/**
 * Formats the TPS readings into a styled promptline label showing the live
 * (current) reading and the running average, separated by the bolt icon.
 *
 * The label is always non-empty so the promptline TPS slot never collapses: a
 * reading of zero (before any stream, or a degenerate sample) renders a dash
 * in place of that number rather than disappearing.
 *
 * Both readings are gray. Only the bolt separator is colored by live TPS:
 * blue at 300+, green at 200+, orange at 100+, and red below 100.
 * The FontAwesome "bolt" (Nerd-Font PUA \uf0e7) is the separator between the two.
 *
 * The icon matches the Nerd-Font PUA icon family the promptline already uses
 * (e.g. \uf07c folder, \uf1c0 spinner), so it reads as part of the same set
 * rather than an out-of-style emoji.
 */

/** FontAwesome "bolt" glyph (Nerd-Font PUA). */
const TPS_ICON = "\uf0e7";
const TPS_NONE = "—";

const TPS_RESET = "\x1b[0m";
const TPS_BLUE = "\x1b[38;2;87;183;255m";
const TPS_GREEN = "\x1b[38;2;80;220;120m";
const TPS_ORANGE = "\x1b[38;2;255;165;0m";
const TPS_RED = "\x1b[38;2;240;90;90m";
const TPS_GRAY = "\x1b[38;2;140;140;140m";

/**
 * Picks the ANSI foreground color for a live TPS reading.
 *
 * @param value Whole-number live TPS reading.
 * @returns ANSI foreground color code.
 */
function getTpsTierColor(value: number): string {
	if (value <= 0) return TPS_GRAY;
	if (value >= 300) return TPS_BLUE;
	if (value >= 200) return TPS_GREEN;
	if (value >= 100) return TPS_ORANGE;
	return TPS_RED;
}

/**
 * Builds the styled TPS label: live reading, the bolt separator, and the
 * running average. Each number renders a dash when it is zero.
 *
 * @param current Live (sliding-window) TPS reading (>= 0).
 * @param avg Running average TPS reading (>= 0).
 * @returns ANSI-styled label string, always non-empty.
 */
export function formatPromptlineTpsLabel(
	current: number,
	avg: number,
): string {
	const currentText = current > 0 ? `${current}` : TPS_NONE;
	const avgText = avg > 0 ? `${avg}` : TPS_NONE;
	return (
		`${TPS_GRAY}${currentText}${TPS_RESET}` +
		` ${getTpsTierColor(current)}${TPS_ICON}${TPS_RESET}` +
		` ${TPS_GRAY}${avgText}${TPS_RESET}`
	);
}
