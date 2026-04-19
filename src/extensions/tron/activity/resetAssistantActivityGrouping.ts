import { activityInvalidators, bridgedToolCallIds, setActiveToolGroup, toolNeighbors } from "./state.ts";

/**
 * Clears all cached grouping state.
 */
export function resetAssistantActivityGrouping(): void {
	toolNeighbors.clear();
	activityInvalidators.clear();
	bridgedToolCallIds.clear();
	setActiveToolGroup([]);
}
