import { collapsedSummaryNeighbors } from "./collapsedSummaryState.ts";

/**
 * Reads cached border ownership for one collapsed thinking summary row.
 *
 * @param toolCallId Leader tool call id.
 * @returns Neighbor ownership flags.
 */
export function getCollapsedSummaryNeighbors(toolCallId: string): { isFirst: boolean; isLast: boolean } {
	return collapsedSummaryNeighbors.get(toolCallId) ?? { isFirst: true, isLast: true };
}
