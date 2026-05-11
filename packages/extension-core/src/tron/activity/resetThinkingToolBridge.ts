import { bridgedToolCallClosingIds, bridgedToolCallIds, toolActivityFrameCursor, toolCallBottomBorderIds, toolCallFrameSyncedIds, toolCallTopBorderIds } from "./state.ts";

/**
 * Clears all cached thinking-to-tool bridge state.
 */
export function resetThinkingToolBridge(): void {
	bridgedToolCallIds.clear();
	bridgedToolCallClosingIds.clear();
	toolCallTopBorderIds.clear();
	toolCallBottomBorderIds.clear();
	toolCallFrameSyncedIds.clear();
	toolActivityFrameCursor.lastToolCallId = undefined;
}
