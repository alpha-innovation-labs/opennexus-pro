/**
 * Sanitizes one CLI table cell while preserving readable text.
 *
 * @param value Raw table cell value.
 * @returns Single-line table-safe cell value.
 */
export function formatSessionTableCell(value: string): string {
	return value
		.replace(/[\r\n\t]+/g, " ")
		.replace(/\|/g, "¦")
		.trim();
}
