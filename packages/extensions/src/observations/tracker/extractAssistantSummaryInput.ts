/**
 * Extracts high-level assistant output and hidden thinking from a message.
 *
 * @param message Assistant message.
 * @returns Assistant text and thinking.
 */
export function extractAssistantSummaryInput(message: {
	content?: Array<{ type?: string; text?: string; thinking?: string }>;
}): { text: string; thinking: string } {
	const content = message.content ?? [];
	const text = content
		.filter((part) => part.type === "text" && typeof part.text === "string")
		.map((part) => part.text)
		.join("\n\n")
		.trim();
	const thinking = content
		.filter((part) => part.type === "thinking" && typeof part.thinking === "string")
		.map((part) => part.thinking)
		.join("\n\n")
		.trim();
	return { text, thinking };
}
