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
	diffCount: number;
	toolCallCount: number;
	durationLabel?: string;
} {
	const leaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	const toolNames = [...(stats?.toolNames.values() ?? [])];
	const uniqueToolNames = [...new Set(toolNames)];
	const icon = uniqueToolNames.length === 1 ? iconForToolName(uniqueToolNames[0] as string) : iconForToolName("tools");
	const toolCallCount = stats?.toolCallIds.length ?? 1;
	let durationLabel: string | undefined;
	if (typeof stats?.startedAt === "number") {
		const finishedAt = typeof stats.finishedAt === "number" ? stats.finishedAt : Date.now();
		durationLabel = formatCompactDuration(Math.max(0, finishedAt - stats.startedAt));
	} else if (typeof stats?.firstAssistantTimestamp === "number" && typeof stats.lastAssistantTimestamp === "number") {
		durationLabel = formatCompactDuration(Math.max(0, stats.lastAssistantTimestamp - stats.firstAssistantTimestamp));
	}

	return {
		leaderToolCallId,
		icon,
		diffCount: stats?.diffCount ?? 0,
		toolCallCount,
		durationLabel,
	};
}
