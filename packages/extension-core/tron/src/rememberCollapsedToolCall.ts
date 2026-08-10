import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState";
import { getToolLineChangeStats } from "./getToolLineChangeStats";
import { syncCollapsedToolGroup } from "./syncCollapsedToolGroup";

/**
 * Records tool metadata needed by the collapsed summary renderer.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 */
export function rememberCollapsedToolCall(toolCallId: string, toolName: string, args: Record<string, unknown>): void {
	if (!toolCallId) return;
	if (!collapsedToolGroupLeaderByToolCallId.has(toolCallId)) syncCollapsedToolGroup([toolCallId]);

	const leaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	if (!stats) return;

	stats.toolNames.set(toolCallId, toolName);
	if (stats.countedToolCallIds.has(toolCallId)) return;
	stats.countedToolCallIds.add(toolCallId);
	const changeStats = getToolLineChangeStats(toolName, args);
	stats.addedLineCount += changeStats.added;
	stats.removedLineCount += changeStats.removed;
}
