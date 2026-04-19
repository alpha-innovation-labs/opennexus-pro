import { registerToolActivityGroup } from "./registerToolActivityGroup.ts";
import { activeToolGroup } from "./state.ts";

/**
 * Appends a tool call to the currently active tool group.
 *
 * @param toolCallId Tool call id to append.
 */
export function registerToolActivity(toolCallId: string): void {
	if (!toolCallId) return;
	if (activeToolGroup.includes(toolCallId)) return;
	registerToolActivityGroup([...activeToolGroup, toolCallId]);
}
