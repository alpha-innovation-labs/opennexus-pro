import { invalidateActivityKeys } from "./invalidateActivityKeys.ts";
import { collapsedToolGroupLeaderByToolCallId, collapsedToolGroupStatsByLeader } from "./collapsedToolGroupState.ts";
import { toolActivityKey } from "./toolActivityKey.ts";

/**
 * Marks the finish time for one collapsed tool-group run.
 *
 * @param toolCallId Tool call id.
 * @param finishedAt Finish timestamp in milliseconds.
 */
export function noteCollapsedToolExecutionEnd(toolCallId: string, finishedAt = Date.now()): void {
	const leaderToolCallId = collapsedToolGroupLeaderByToolCallId.get(toolCallId) ?? toolCallId;
	const stats = collapsedToolGroupStatsByLeader.get(leaderToolCallId);
	if (!stats) return;

	stats.finishedAt = finishedAt;
	invalidateActivityKeys(stats.toolCallIds.map((currentToolCallId) => toolActivityKey(currentToolCallId)));
}
