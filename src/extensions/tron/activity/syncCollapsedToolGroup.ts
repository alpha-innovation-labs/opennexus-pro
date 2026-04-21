import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";

/**
 * Syncs collapsed-group membership for one contiguous tool block.
 *
 * @param toolCallIds Tool call ids in display order.
 * @param assistantTimestamp Optional assistant-message timestamp for duration fallback.
 */
export function syncCollapsedToolGroup(toolCallIds: string[], assistantTimestamp?: number): void {
	const uniqueToolCallIds = toolCallIds.filter((toolCallId, index) => toolCallId && toolCallIds.indexOf(toolCallId) === index);
	if (uniqueToolCallIds.length === 0) return;

	const leaderToolCallId = uniqueToolCallIds[0] as string;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId) ?? {
		toolCallIds: uniqueToolCallIds,
		toolNames: new Map<string, string>(),
		diffToolCallIds: new Set<string>(),
		diffCount: 0,
	};

	stats.toolCallIds = uniqueToolCallIds;
	if (typeof assistantTimestamp === "number") {
		stats.firstAssistantTimestamp ??= assistantTimestamp;
		stats.lastAssistantTimestamp = assistantTimestamp;
	}
	collapsedToolGroupStatsByLeader.set(leaderToolCallId, stats);

	for (const toolCallId of uniqueToolCallIds) {
		collapsedToolGroupLeaderByToolCallId.set(toolCallId, leaderToolCallId);
	}
}
