import { getAssistantMessageStartedAt } from "../thinking/assistantMessageTimingState.ts";
import { bridgeMessageThinkingToTools } from "./bridgeMessageThinkingToTools.ts";
import { closeToolActivityGroup } from "./closeToolActivityGroup.ts";
import { markCollapsedSummaryMessage } from "./collapsedSummaryMessageState.ts";
import { finishCollapsedToolGroupThinkingWindow } from "./finishCollapsedToolGroupThinkingWindow.ts";
import { getAssistantMessageToolCallIds } from "./getAssistantMessageToolCallIds.ts";
import { getLeadingAssistantToolSummary } from "./getLeadingAssistantToolSummary.ts";
import { hasVisibleAssistantMessageContent } from "./hasVisibleAssistantMessageContent.ts";
import { registerCollapsedSummary } from "./registerCollapsedSummary.ts";
import { registerToolActivityGroup } from "./registerToolActivityGroup.ts";
import { setCollapsedToolGroupSummary } from "./setCollapsedToolGroupSummary.ts";
import { shouldStartNewAssistantToolGroup } from "./shouldStartNewAssistantToolGroup.ts";
import { syncCollapsedToolGroup } from "./syncCollapsedToolGroup.ts";
import { activeToolGroup } from "./state.ts";

/**
 * Applies Tron tool grouping rules for one assistant message.
 *
 * Tool-only follow-up messages stay attached to the active group. Messages that
 * introduce visible content before tool calls begin a fresh group.
 *
 * @param message Assistant message payload.
 */
export function applyAssistantMessageToolGrouping(message: { timestamp?: unknown; content?: Array<{ type?: unknown; id?: unknown; text?: unknown; thinking?: unknown }> }): void {
	const toolCallIds = getAssistantMessageToolCallIds(message);
	const assistantTimestamp = typeof message.timestamp === "number" ? message.timestamp : undefined;
	const thinkingStartedAt = typeof assistantTimestamp === "number"
		? (getAssistantMessageStartedAt(assistantTimestamp) ?? assistantTimestamp)
		: undefined;
	if (toolCallIds.length > 0) syncCollapsedToolGroup(toolCallIds, assistantTimestamp);
	if (toolCallIds.length === 0) {
		if (!hasVisibleAssistantMessageContent(message)) {
			return;
		}
		if (activeToolGroup.length > 0 && typeof thinkingStartedAt === "number") finishCollapsedToolGroupThinkingWindow(activeToolGroup[0] as string, thinkingStartedAt);
		closeToolActivityGroup();
		return;
	}

	bridgeMessageThinkingToTools(message);
	if (shouldStartNewAssistantToolGroup(message)) {
		if (activeToolGroup.length > 0 && typeof thinkingStartedAt === "number") finishCollapsedToolGroupThinkingWindow(activeToolGroup[0] as string, thinkingStartedAt);
		registerToolActivityGroup(toolCallIds);
		const leadingSummary = getLeadingAssistantToolSummary(message);
		setCollapsedToolGroupSummary(toolCallIds[0] as string, leadingSummary.previewText, leadingSummary.expandedText, thinkingStartedAt);
		registerCollapsedSummary(toolCallIds[0] as string);
		if (typeof assistantTimestamp === "number") markCollapsedSummaryMessage(assistantTimestamp);
		return;
	}

	registerToolActivityGroup([...activeToolGroup, ...toolCallIds]);
}
