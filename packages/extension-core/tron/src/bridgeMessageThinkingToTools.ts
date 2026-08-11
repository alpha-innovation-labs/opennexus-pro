import { bridgeThinkingToToolCalls } from "./activity/bridgeThinkingToToolCalls";
import { getImmediateFollowingToolCallGroup } from "./activity/getImmediateFollowingToolCallGroup";

/**
 * Marks tool sections that directly follow thinking so they share one divider.
 *
 * @param message Assistant message payload.
 */
export function bridgeMessageThinkingToTools(message: unknown): void {
	for (let index = 0; index < (message.content ?? []).length; index++) {
		const content = message.content[index];
		if (
			content?.type !== "thinking" ||
			typeof content.thinking !== "string" ||
			!content.thinking.trim()
		)
			continue;
		const group = getImmediateFollowingToolCallGroup(
			message.content ?? [],
			index,
		);
		if (group.toolCallIds.length > 0) {
			bridgeThinkingToToolCalls(group.toolCallIds, !group.followedByThinking);
		}
	}
}
