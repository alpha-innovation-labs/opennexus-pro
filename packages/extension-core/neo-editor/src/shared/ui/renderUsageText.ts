const TEAL = "\x1b[38;2;125;214;198m";
const ORANGE = "\x1b[38;2;230;170;80m";
const RED = "\x1b[38;2;210;90;90m";
const RESET = "\x1b[0m";

/**
 * Renders usage text with colored gauge icons.
 *
 * @param uiTheme Active UI theme.
 * @param text Plain usage text.
 * @returns Usage text with colored icons.
 */
export function renderUsageText(
	uiTheme: { fg(color: string, value: string): string },
	text: string,
): string {
	const slots = text.split("|").map((slot) => slot.trim());
	const renderedSlots = slots.map((slot) => {
		const match = slot.match(/^(○|◔|◑|◕|●)\s+(--|\d+%)$/);
		if (!match) return uiTheme.fg("dim", slot);
		const [, icon, value] = match;
		const numeric =
			value === "--" ? undefined : Number.parseInt(value.replace("%", ""), 10);
		const color =
			typeof numeric !== "number" || !Number.isFinite(numeric)
				? TEAL
				: numeric >= 66.67
					? RED
					: numeric >= 33.33
						? ORANGE
						: TEAL;
		return `${color}${icon} ${value}${RESET}`;
	});
	return renderedSlots.join(uiTheme.fg("dim", " | "));
}
