const RTK_SAVINGS_LABEL_WIDTH = 17;

/**
 * Formats an RTK savings metric row with a shared value column.
 *
 * @param label Metric label.
 * @param value Rendered metric value.
 * @returns Aligned modal row.
 */
export function formatRtkSavingsMetricLine(
	label: string,
	value: string,
): string {
	return `${label.padEnd(RTK_SAVINGS_LABEL_WIDTH)} ${value}`;
}
