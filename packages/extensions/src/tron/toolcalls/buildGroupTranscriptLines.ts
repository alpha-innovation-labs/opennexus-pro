import { sanitizePlainText } from "@nexus/tui-kit/modal/index.js";
import type { ToolCallGroup } from "./types.js";

/**
 * Builds transcript preview lines for one grouped user turn.
 *
 * @param group Tool-call group.
 * @returns Scrollable transcript lines.
 */
export function buildGroupTranscriptLines(group: ToolCallGroup): string[] {
	const lines: string[] = [
		"User",
		sanitizePlainText(group.userPreview),
	];

	for (const toolCall of group.toolCalls) {
		lines.push("");
		lines.push(`Assistant #${toolCall.assistantIndex}`);
		if (toolCall.assistantThinking.trim()) lines.push(...sanitizePlainText(toolCall.assistantThinking).split("\n"));
		if (toolCall.assistantPreview.trim()) {
			lines.push("");
			lines.push("Message");
			lines.push(...sanitizePlainText(toolCall.assistantPreview).split("\n"));
		}
		lines.push("");
		lines.push(`Tool ${toolCall.toolName}`);
		lines.push(sanitizePlainText(JSON.stringify(toolCall.arguments, null, 2)));
		if (toolCall.result?.content) {
			lines.push("");
			lines.push("Result");
			lines.push(sanitizePlainText(JSON.stringify(toolCall.result.content, null, 2)));
		}
	}

	return lines;
}
