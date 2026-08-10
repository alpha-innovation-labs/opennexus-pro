import { previewContent } from "./previewContent";
import { toJsonLines } from "./toJsonLines";
import { toPlainTextLines } from "./toPlainTextLines";
import type { ToolCallInfo } from "./types";

/**
 * Formats fallback detail lines for one tool call.
 *
 * @param toolCall Tool call info.
 * @returns Detail lines.
 */
export function formatToolCallDetails(toolCall: ToolCallInfo): string[] {
	const lines: string[] = [];
	lines.push(`${toolCall.toolName}`);
	lines.push(`call id: ${toolCall.toolCallId}`);
	lines.push(`assistant message: #${toolCall.assistantIndex}`);
	if (toolCall.assistantPreview) lines.push(`context: ${toolCall.assistantPreview}`);
	if (toolCall.assistantThinking) {
		lines.push("Thinking");
		lines.push(...toPlainTextLines(toolCall.assistantThinking));
	}
	lines.push("Arguments");
	lines.push(...toJsonLines(toolCall.arguments));
	if (!toolCall.result) {
		lines.push("Result");
		lines.push("No tool result found on the current branch.");
		return lines;
	}
	lines.push(`Result${toolCall.result.isError ? " (error)" : ""}`);
	lines.push(previewContent(toolCall.result.content));
	if (toolCall.result.details !== undefined) {
		lines.push("Details");
		lines.push(...toJsonLines(toolCall.result.details));
	}
	return lines;
}
