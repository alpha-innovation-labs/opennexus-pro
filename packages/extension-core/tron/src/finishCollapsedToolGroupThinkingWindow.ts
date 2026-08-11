import {
	collapsedToolGroupLeaderByToolCallId,
	collapsedToolGroupStatsByLeader,
} from "./collapsedToolGroupState";

/**
 * Closes one collapsed thinking window when the next thinking block begins.
 *
 * @param toolCallId Any tool call id from the previous group.
 * @param nextThinkingStartedAt Start time of the next thinking block.
 */
export function finishCollapsedToolGroupThinkingWindow(
	toolCallId: string,
	nextThinkingStartedAt: number,
): void {
	const leaderToolCallId =
		collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	if (!stats || typeof stats.thinkingStartedAt !== "number") return;
	stats.nextThinkingStartedAt = nextThinkingStartedAt;
}
