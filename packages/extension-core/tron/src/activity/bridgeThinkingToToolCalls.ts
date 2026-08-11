import { bridgedToolCallClosingIds, bridgedToolCallIds } from "./state";

/**
 * Marks the first tool call in a group as visually attached to prior thinking.
 *
 * @param toolCallIds Tool call ids emitted by one assistant message.
 * @param closeAtLastTool Whether the final tool should close the shared box.
 */
export function bridgeThinkingToToolCalls(
	toolCallIds: string[],
	closeAtLastTool = true,
): void {
	for (const toolCallId of toolCallIds) {
		if (toolCallId) bridgedToolCallIds.add(toolCallId);
	}

	const lastToolCallId = toolCallIds.findLast(Boolean);
	if (closeAtLastTool && lastToolCallId)
		bridgedToolCallClosingIds.add(lastToolCallId);
}
