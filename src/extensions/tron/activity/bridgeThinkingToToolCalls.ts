import { bridgedToolCallIds } from "./state.ts";

/**
 * Marks the first tool call in a group as visually attached to prior thinking.
 *
 * @param toolCallIds Tool call ids emitted by one assistant message.
 */
export function bridgeThinkingToToolCalls(toolCallIds: string[]): void {
	const firstToolCallId = toolCallIds.find(Boolean);
	if (!firstToolCallId) return;
	bridgedToolCallIds.add(firstToolCallId);
}
