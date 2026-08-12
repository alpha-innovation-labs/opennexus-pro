import type { SharedModalTheme } from "@nexus/tui-kit";

/**
 * Applies the RTK savings number color.
 *
 * @param theme Active UI theme.
 * @param value Value to colorize.
 * @returns Colorized value.
 */
export function colorizeSavingsValue(
	theme: SharedModalTheme,
	value: string,
): string {
	return theme.fg("accent", value);
}
