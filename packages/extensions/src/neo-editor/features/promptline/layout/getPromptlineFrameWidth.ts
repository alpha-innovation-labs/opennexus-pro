/**
 * Calculates the promptline frame width for the current conversation state.
 *
 * @param terminalWidth Current render width.
 * @param hasMessages Whether the active conversation already has messages.
 * @returns Full width for active conversations, half width for empty conversations.
 */
export function getPromptlineFrameWidth(terminalWidth: number, hasMessages: boolean): number {
	if (hasMessages) return terminalWidth;
	return Math.max(1, Math.floor(terminalWidth / 2));
}
