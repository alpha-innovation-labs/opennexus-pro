import { bridgeMessageThinkingToTools } from "./bridgeMessageThinkingToTools.ts";
import { closeToolActivityGroup } from "./closeToolActivityGroup.ts";
import { getAssistantMessageToolCallIds } from "./getAssistantMessageToolCallIds.ts";
import { registerToolActivityGroup } from "./registerToolActivityGroup.ts";
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
	if (toolCallIds.length > 0) syncCollapsedToolGroup(toolCallIds, assistantTimestamp);
	if (toolCallIds.length === 0) {
		closeToolActivityGroup();
		return;
	}

	bridgeMessageThinkingToTools(message);
	if (shouldStartNewAssistantToolGroup(message)) {
		registerToolActivityGroup(toolCallIds);
		return;
	}

	registerToolActivityGroup([...activeToolGroup, ...toolCallIds]);
}
