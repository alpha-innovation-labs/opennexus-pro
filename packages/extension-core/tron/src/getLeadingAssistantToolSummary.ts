import { getThinkingPreview } from "./thinking/getThinkingPreview";

type AssistantContentBlock = { type?: unknown; text?: unknown; thinking?: unknown };

/**
 * Picks preview and expanded text for the assistant content that introduces a tool group.
 *
 * @param message Assistant message payload.
 * @returns Preview and expanded text.
 */
export function getLeadingAssistantToolSummary(message: { content?: AssistantContentBlock[] }): { previewText: string; expandedText: string } {
	const content = message.content ?? [];
	const firstToolCallIndex = content.findIndex((block) => block?.type === "toolCall");
	if (firstToolCallIndex <= 0) return { previewText: "", expandedText: "" };

	for (const block of content.slice(0, firstToolCallIndex)) {
		if (block?.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
			const thinking = block.thinking.trim();
			return { previewText: getThinkingPreview(thinking), expandedText: thinking };
		}
		if (block?.type === "text" && typeof block.text === "string" && block.text.trim()) {
			const text = block.text.trim();
			return { previewText: text, expandedText: text };
		}
	}

	return { previewText: "", expandedText: "" };
}
