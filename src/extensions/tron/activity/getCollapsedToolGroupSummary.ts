import { formatCompactDuration } from "../duration/formatCompactDuration.ts";
import { iconForToolName } from "../compact-tool-lines/iconForToolName.ts";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";

/**
 * Reads the summary data for one collapsed tool group.
 *
 * @param toolCallId Any tool call id from the group.
 * @returns Render-ready summary data.
 */
export function getCollapsedToolGroupSummary(toolCallId: string): {
	leaderToolCallId: string;
	icon: string;
	addedLineCount: number;
	removedLineCount: number;
	summaryText: string;
	fullThinkingText: string;
	toolCallCount: number;
	durationLabel?: string;
} {
	const leaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	const toolNames = [...(stats?.toolNames.values() ?? [])];
	const uniqueToolNames = [...new Set(toolNames)];
	const icon = uniqueToolNames.length === 1 ? iconForToolName(uniqueToolNames[0] as string) : iconForToolName("tools");
	const toolCallCount = stats?.toolCallIds.length ?? 1;
	const durationLabel = typeof stats?.thinkingStartedAt === "number" && typeof stats.nextThinkingStartedAt === "number"
		? formatCompactDuration(Math.max(0, stats.nextThinkingStartedAt - stats.thinkingStartedAt))
		: undefined;

	return {
		leaderToolCallId,
		icon,
		addedLineCount: stats?.addedLineCount ?? 0,
		removedLineCount: stats?.removedLineCount ?? 0,
		summaryText: stats?.summaryText ?? "Thinking…",
		fullThinkingText: stats?.fullThinkingText ?? stats?.summaryText ?? "Thinking…",
		toolCallCount,
		durationLabel,
	};
}
