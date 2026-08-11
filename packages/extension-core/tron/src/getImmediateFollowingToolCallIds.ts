import { getImmediateFollowingToolCallGroup } from "./activity/getImmediateFollowingToolCallGroup";

type ToolCallContent = { type?: unknown; id?: unknown; text?: unknown; thinking?: unknown };

/**
 * Returns the contiguous tool-call ids that immediately follow a thinking block.
 *
 * @param content Assistant message content blocks.
 * @param index Thinking block index.
 * @returns Tool call ids directly attached to that thinking block.
 */
export function getImmediateFollowingToolCallIds(content: ToolCallContent[], index: number): string[] {
	return getImmediateFollowingToolCallGroup(content, index).toolCallIds;
}
