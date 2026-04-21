type AssistantContentBlock = { type?: unknown; text?: unknown; thinking?: unknown };

/**
 * Returns whether an assistant message should start a fresh tool group.
 *
 * A new group begins only when visible assistant content appears before the
 * first tool call in that message.
 *
 * @param message Assistant message payload.
 * @returns Whether the message starts a new visual tool group.
 */
export function shouldStartNewAssistantToolGroup(message: { content?: AssistantContentBlock[] }): boolean {
	const content = message.content ?? [];
	const firstToolCallIndex = content.findIndex((block) => block?.type === "toolCall");
	if (firstToolCallIndex <= 0) return false;

	return content.slice(0, firstToolCallIndex).some((block) => {
		if (block?.type === "thinking" && typeof block.thinking === "string") return block.thinking.trim().length > 0;
		if (block?.type === "text" && typeof block.text === "string") return block.text.trim().length > 0;
		return false;
	});
}
