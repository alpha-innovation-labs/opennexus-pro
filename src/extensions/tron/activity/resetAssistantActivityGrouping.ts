import { activityInvalidators, bridgedToolCallIds, setActiveToolGroup, toolNeighbors } from "./state.ts";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";

/**
 * Clears all cached grouping state.
 */
export function resetAssistantActivityGrouping(): void {
	toolNeighbors.clear();
	activityInvalidators.clear();
	bridgedToolCallIds.clear();
	collapsedToolGroupLeaderByToolCallId.clear();
	collapsedToolGroupStatsByLeader.clear();
	setActiveToolGroup([]);
}
