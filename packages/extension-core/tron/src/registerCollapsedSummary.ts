import { collapsedSummaryNeighbors, collapsedSummaryOrder } from "./collapsedSummaryState";

/**
 * Registers one collapsed summary row in render order.
 *
 * @param toolCallId Leader tool call id for the summary row.
 */
export function registerCollapsedSummary(toolCallId: string): void {
	if (!toolCallId || collapsedSummaryOrder.includes(toolCallId)) return;
	collapsedSummaryOrder.push(toolCallId);
	for (const [index, currentToolCallId] of collapsedSummaryOrder.entries()) {
		collapsedSummaryNeighbors.set(currentToolCallId, {
			isFirst: index === 0,
			isLast: index === collapsedSummaryOrder.length - 1,
		});
	}
}
