/**
 * Formats a percentage for context usage output.
 *
 * @param percent Percentage value.
 * @returns Percentage label.
 */
export function formatPercent(percent: number | null): string {
	return percent === null ? "unknown" : `${percent.toFixed(1)}%`;
}
