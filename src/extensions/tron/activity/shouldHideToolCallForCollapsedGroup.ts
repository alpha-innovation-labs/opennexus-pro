import { isToolGroupCollapseEnabled } from "../collapse/state.ts";
import { collapsedToolGroupLeaderByToolCallId } from "./collapsedToolGroupState.ts";

/**
 * Returns whether one tool call row should be hidden in collapsed mode.
 *
 * @param toolCallId Tool call id.
 * @returns True when the row should not render.
 */
export function shouldHideToolCallForCollapsedGroup(toolCallId: string): boolean {
	if (!isToolGroupCollapseEnabled()) return false;
	return (collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId) !== toolCallId;
}
