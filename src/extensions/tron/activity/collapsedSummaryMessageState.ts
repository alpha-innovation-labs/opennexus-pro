const collapsedSummaryMessageTimestamps = new Set<number>();

/**
 * Marks one assistant message timestamp as visually replaced by a collapsed summary.
 *
 * @param messageTimestamp Assistant message timestamp.
 */
export function markCollapsedSummaryMessage(messageTimestamp: number): void {
	collapsedSummaryMessageTimestamps.add(messageTimestamp);
}

/**
 * Returns whether one assistant message should hide its normal thinking block.
 *
 * @param messageTimestamp Assistant message timestamp.
 * @returns True when the message is replaced by a collapsed summary row.
 */
export function isCollapsedSummaryMessage(messageTimestamp: number): boolean {
	return collapsedSummaryMessageTimestamps.has(messageTimestamp);
}

/**
 * Clears all remembered collapsed-summary message timestamps.
 */
export function resetCollapsedSummaryMessages(): void {
	collapsedSummaryMessageTimestamps.clear();
}
