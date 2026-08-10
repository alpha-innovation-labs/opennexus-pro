import { activityInvalidators, bridgedToolCallClosingIds, bridgedToolCallIds, toolActivityFrameCursor, toolCallBottomBorderIds, toolCallFrameSyncedIds, toolCallTopBorderIds } from "./state";
import { collapsedSummaryNeighbors, collapsedSummaryOrder } from "../collapsedSummaryState";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "../collapsedToolGroupState";
import { resetCollapsedSummaryMessages } from "../collapsedSummaryMessageState";

/**
 * Clears all cached grouping state.
 */
export function resetAssistantActivityGrouping(): void {
	activityInvalidators.clear();
	bridgedToolCallIds.clear();
	bridgedToolCallClosingIds.clear();
	toolCallTopBorderIds.clear();
	toolCallBottomBorderIds.clear();
	toolCallFrameSyncedIds.clear();
	toolActivityFrameCursor.lastToolCallId = undefined;
	collapsedSummaryNeighbors.clear();
	collapsedSummaryOrder.length = 0;
	collapsedToolGroupLeaderByToolCallId.clear();
	collapsedToolGroupStatsByLeader.clear();
	resetCollapsedSummaryMessages();
}
