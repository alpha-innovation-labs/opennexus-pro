import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";
import { getToolDiffCount } from "./getToolDiffCount.ts";
import { syncCollapsedToolGroup } from "./syncCollapsedToolGroup.ts";

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
	if (stats.diffToolCallIds.has(toolCallId)) return;
	stats.diffToolCallIds.add(toolCallId);
	stats.diffCount += getToolDiffCount(toolName, args);
}
