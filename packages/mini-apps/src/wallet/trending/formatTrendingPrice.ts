/**
 * Formats a USD price for trending assets.
 *
 * @param value USD price.
 * @returns USD price text.
 */
export function formatTrendingPrice(value: number): string {
	if (value >= 1) return `$${value.toFixed(2)}`;
	if (value >= 0.01) return `$${value.toFixed(4)}`;
	return `$${value.toPrecision(3)}`;
}
