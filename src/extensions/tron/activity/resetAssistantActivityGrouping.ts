import { activityInvalidators, bridgedToolCallIds, setActiveToolGroup, toolNeighbors } from "./state.ts";
import { collapsedSummaryNeighbors, collapsedSummaryOrder } from "./collapsedSummaryState.ts";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";
import { resetCollapsedSummaryMessages } from "./collapsedSummaryMessageState.ts";

/**
 * Clears all cached grouping state.
 */
export function resetAssistantActivityGrouping(): void {
	toolNeighbors.clear();
	activityInvalidators.clear();
	bridgedToolCallIds.clear();
	collapsedSummaryNeighbors.clear();
	collapsedSummaryOrder.length = 0;
	collapsedToolGroupLeaderByToolCallId.clear();
	collapsedToolGroupStatsByLeader.clear();
	resetCollapsedSummaryMessages();
	setActiveToolGroup([]);
}
