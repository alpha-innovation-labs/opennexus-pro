/**
 * Normalizes observation summary text into one compact paragraph.
 *
 * @param value Text to normalize.
 * @returns Single-paragraph text with collapsed whitespace.
 */
export function normalizeObservationSummaryText(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}
