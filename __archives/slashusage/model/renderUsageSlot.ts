import { formatUsageSlot } from "./formatUsageSlot.js";
import { getUsageIconColor } from "./getUsageIconColor.js";

const RESET = "\x1b[0m";

/**
 * Renders one usage slot with a colored gauge icon.
 *
 * @param theme Pi UI theme.
 * @param value Used percentage.
 * @returns Rendered usage slot.
 */
export function renderUsageSlot(
	theme: { fg(color: string, value: string): string },
	value: number | undefined,
): string {
	const [icon, ...rest] = formatUsageSlot(value).split(" ");
	const suffix = rest.join(" ");
	const color = getUsageIconColor(value);
	return `${color}${icon} ${suffix}${RESET}`;
}
