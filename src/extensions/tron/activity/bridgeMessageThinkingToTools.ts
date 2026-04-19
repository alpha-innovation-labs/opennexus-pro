import { bridgeThinkingToToolCalls } from "./bridgeThinkingToToolCalls.ts";
import { getImmediateFollowingToolCallIds } from "./getImmediateFollowingToolCallIds.ts";

/**
 * Marks tool sections that directly follow thinking so they share one divider.
 *
 * @param message Assistant message payload.
 */
export function bridgeMessageThinkingToTools(message: any): void {
	for (let index = 0; index < (message.content ?? []).length; index++) {
		const content = message.content[index];
		if (content?.type !== "thinking" || typeof content.thinking !== "string" || !content.thinking.trim()) continue;
		const toolCallIds = getImmediateFollowingToolCallIds(message.content ?? [], index);
		if (toolCallIds.length > 0) {
			bridgeThinkingToToolCalls(toolCallIds);
		}
	}
}
