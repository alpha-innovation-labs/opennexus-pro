import { getThinkingPreview } from "./thinking/getThinkingPreview";

type AssistantContentBlock = { type?: unknown; text?: unknown; thinking?: unknown };

/**
 * Picks the visible summary text that introduces an assistant tool group.
 *
 * @param message Assistant message payload.
 * @returns Leading thinking or text preview.
 */
export function getLeadingAssistantToolSummaryText(message: { content?: AssistantContentBlock[] }): string {
	const content = message.content ?? [];
	const firstToolCallIndex = content.findIndex((block) => block?.type === "toolCall");
	if (firstToolCallIndex <= 0) return "";

	for (const block of content.slice(0, firstToolCallIndex)) {
		if (block?.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
			return getThinkingPreview(block.thinking.trim());
		}
		if (block?.type === "text" && typeof block.text === "string" && block.text.trim()) return block.text.trim();
	}

	return "";
}
