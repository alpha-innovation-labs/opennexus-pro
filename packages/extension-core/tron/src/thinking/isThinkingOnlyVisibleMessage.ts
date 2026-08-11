/**
 * Returns whether one assistant message shows visible thinking and no visible text.
 *
 * @param message Assistant message payload.
 * @returns True when visible assistant content is thinking-only.
 */
export function isThinkingOnlyVisibleMessage(message: {
	content?: Array<{ type?: unknown; text?: unknown; thinking?: unknown }>;
}): boolean {
	const content = Array.isArray(message.content) ? message.content : [];
	const hasVisibleThinking = content.some(
		(block) =>
			block?.type === "thinking" &&
			typeof block.thinking === "string" &&
			block.thinking.trim().length > 0,
	);
	const hasVisibleText = content.some(
		(block) =>
			block?.type === "text" &&
			typeof block.text === "string" &&
			block.text.trim().length > 0,
	);
	return hasVisibleThinking && !hasVisibleText;
}
