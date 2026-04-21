import { invalidateActivityKeys } from "./invalidateActivityKeys.ts";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";
import { rememberCollapsedToolCall } from "./rememberCollapsedToolCall.ts";
import { syncCollapsedToolGroup } from "./syncCollapsedToolGroup.ts";
import { toolActivityKey } from "./toolActivityKey.ts";

/**
 * Marks the start time for one collapsed tool-group run.
 *
 * @param toolCallId Tool call id.
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @param startedAt Start timestamp in milliseconds.
 */
export function noteCollapsedToolExecutionStart(toolCallId: string, toolName: string, args: Record<string, unknown>, startedAt = Date.now()): void {
	if (!collapsedToolGroupLeaderByToolCallId.has(toolCallId)) syncCollapsedToolGroup([toolCallId]);
	rememberCollapsedToolCall(toolCallId, toolName, args);

	const leaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	if (!stats) return;

	stats.startedAt ??= startedAt;
	if (typeof stats.finishedAt === "number" && startedAt > stats.finishedAt) stats.finishedAt = undefined;
	invalidateActivityKeys(stats.toolCallIds.map((currentToolCallId) => toolActivityKey(currentToolCallId)));
}
