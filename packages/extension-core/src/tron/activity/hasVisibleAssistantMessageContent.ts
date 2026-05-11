type AssistantContentBlock = { type?: unknown; text?: unknown; thinking?: unknown };

/**
 * Returns whether an assistant message contains any visible text or thinking.
 *
 * @param message Assistant message payload.
 * @returns Whether the message has visible content.
 */
export function hasVisibleAssistantMessageContent(message: { content?: AssistantContentBlock[] }): boolean {
	return (message.content ?? []).some((block) => {
		if (block?.type === "thinking" && typeof block.thinking === "string") return block.thinking.trim().length > 0;
		if (block?.type === "text" && typeof block.text === "string") return block.text.trim().length > 0;
		return false;
	});
}
