/**
 * Formats a USD token price compactly.
 *
 * @param value USD price.
 * @returns Formatted USD price.
 */
export function formatUsdPrice(value: number): string {
	if (value >= 1) return `$${value.toFixed(2)}`;
	if (value >= 0.01) return `$${value.toFixed(4)}`;
	return `$${value.toPrecision(3)}`;
}
