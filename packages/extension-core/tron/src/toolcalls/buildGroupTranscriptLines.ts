import { sanitizePlainText } from "@nexus/tui-kit";
import type { ToolCallGroup } from "./types";

/**
 * Builds compact transcript preview lines for one grouped user turn.
 *
 * No blank lines are inserted between sections — this is the compact
 * rendering path used by the Tron tool-call group modal.
 *
 * @param group Tool-call group.
 * @returns Scrollable transcript lines.
 */
export function buildGroupTranscriptLines(group: ToolCallGroup): string[] {
	const lines: string[] = ["User", sanitizePlainText(group.userPreview)];

	for (const toolCall of group.toolCalls) {
		lines.push(`Assistant #${toolCall.assistantIndex}`);
		if (toolCall.assistantThinking.trim())
			lines.push(...sanitizePlainText(toolCall.assistantThinking).split("\n"));
		if (toolCall.assistantPreview.trim()) {
			lines.push("Message");
			lines.push(...sanitizePlainText(toolCall.assistantPreview).split("\n"));
		}
		lines.push(`Tool ${toolCall.toolName}`);
		lines.push(sanitizePlainText(JSON.stringify(toolCall.arguments, null, 2)));
		if (toolCall.result?.content) {
			lines.push("Result");
			lines.push(
				sanitizePlainText(JSON.stringify(toolCall.result.content, null, 2)),
			);
		}
	}

	return lines;
}
