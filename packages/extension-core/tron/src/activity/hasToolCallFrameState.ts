import { toolCallFrameSyncedIds } from "./state";

/**
 * Returns whether frame state has been synchronized for one tool call.
 *
 * @param toolCallId Tool call id.
 * @returns True when the tool call has explicit top or bottom border state.
 */
export function hasToolCallFrameState(toolCallId: string): boolean {
	return toolCallFrameSyncedIds.has(toolCallId);
}
