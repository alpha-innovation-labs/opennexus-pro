/**
 * Formats a number for compact table display.
 *
 * @param value Numeric value.
 * @returns Compact text.
 */
export function formatCompactNumber(value: number | undefined): string {
	if (value === undefined || !Number.isFinite(value)) return "-";
	return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 }).format(value);
}
