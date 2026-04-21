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
		countedToolCallIds: new Set<string>(),
		addedLineCount: 0,
		removedLineCount: 0,
	};

	for (const toolCallId of uniqueToolCallIds) {
		const previousLeaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId);
		if (!previousLeaderToolCallId || previousLeaderToolCallId === leaderToolCallId) continue;
		const previousStats = collapsedToolGroupStatsByLeader.get(previousLeaderToolCallId);
		if (!previousStats) continue;
		for (const [currentToolCallId, toolName] of previousStats.toolNames.entries()) stats.toolNames.set(currentToolCallId, toolName);
		for (const currentToolCallId of previousStats.countedToolCallIds.values()) stats.countedToolCallIds.add(currentToolCallId);
		stats.addedLineCount += previousStats.addedLineCount;
		stats.removedLineCount += previousStats.removedLineCount;
		stats.summaryText ??= previousStats.summaryText;
		stats.thinkingStartedAt ??= previousStats.thinkingStartedAt;
		stats.nextThinkingStartedAt ??= previousStats.nextThinkingStartedAt;
		if (typeof previousStats.startedAt === "number") {
			stats.startedAt = typeof stats.startedAt === "number" ? Math.min(stats.startedAt, previousStats.startedAt) : previousStats.startedAt;
		}
		if (typeof previousStats.finishedAt === "number") {
			stats.finishedAt = typeof stats.finishedAt === "number" ? Math.max(stats.finishedAt, previousStats.finishedAt) : previousStats.finishedAt;
		}
		if (typeof previousStats.firstAssistantTimestamp === "number") {
			stats.firstAssistantTimestamp = typeof stats.firstAssistantTimestamp === "number"
				? Math.min(stats.firstAssistantTimestamp, previousStats.firstAssistantTimestamp)
				: previousStats.firstAssistantTimestamp;
		}
		if (typeof previousStats.lastAssistantTimestamp === "number") {
			stats.lastAssistantTimestamp = typeof stats.lastAssistantTimestamp === "number"
				? Math.max(stats.lastAssistantTimestamp, previousStats.lastAssistantTimestamp)
				: previousStats.lastAssistantTimestamp;
		}
		collapsedToolGroupStatsByLeader.delete(previousLeaderToolCallId);
	}

	stats.toolCallIds = uniqueToolCallIds;
	if (typeof assistantTimestamp === "number") {
		stats.firstAssistantTimestamp = Math.min(stats.firstAssistantTimestamp ?? assistantTimestamp, assistantTimestamp);
		stats.lastAssistantTimestamp = Math.max(stats.lastAssistantTimestamp ?? assistantTimestamp, assistantTimestamp);
	}
	collapsedToolGroupStatsByLeader.set(leaderToolCallId, stats);

	for (const toolCallId of uniqueToolCallIds) {
		collapsedToolGroupLeaderByToolCallId.set(toolCallId, leaderToolCallId);
	}
}
