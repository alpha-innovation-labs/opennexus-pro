/**
 * Formats a percentage for the trending table.
 *
 * @param value Percent value.
 * @returns Signed percentage text.
 */
export function formatTrendingPercent(value: number | undefined): string {
	if (value === undefined || !Number.isFinite(value)) return "-";
	return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
