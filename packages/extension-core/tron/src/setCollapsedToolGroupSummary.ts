import {
	collapsedToolGroupLeaderByToolCallId,
	collapsedToolGroupStatsByLeader,
} from "./collapsedToolGroupState";

/**
 * Stores the summary text and timing anchor for one collapsed tool group.
 *
 * @param toolCallId Any tool call id from the group.
 * @param summaryText Thinking or text preview.
 * @param fullThinkingText Full thinking or text content.
 * @param thinkingStartedAt Assistant thinking start time.
 */
export function setCollapsedToolGroupSummary(
	toolCallId: string,
	summaryText: string,
	fullThinkingText: string,
	thinkingStartedAt?: number,
): void {
	const leaderToolCallId =
		collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	if (!stats) return;
	if (summaryText.trim()) stats.summaryText = summaryText.trim();
	if (fullThinkingText.trim()) stats.fullThinkingText = fullThinkingText.trim();
	if (typeof thinkingStartedAt === "number")
		stats.thinkingStartedAt = thinkingStartedAt;
}
