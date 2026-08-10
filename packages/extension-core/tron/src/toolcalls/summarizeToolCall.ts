import type { ToolCallInfo } from "./types";
import { toolIcon } from "./toolIcon";

/**
 * Builds the left-pane label for one tool call.
 *
 * @param toolCall Tool call info.
 * @returns Summary label.
 */
export function summarizeToolCall(toolCall: ToolCallInfo): string {
	return `${toolIcon(toolCall.toolName)} ${toolCall.toolName}`;
}
