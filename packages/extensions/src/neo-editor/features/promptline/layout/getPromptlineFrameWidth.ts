/**
 * Calculates the promptline frame width for the current conversation state.
 *
 * @param terminalWidth Current render width.
 * @param hasMessages Whether the active conversation already has messages.
 * @returns Full width for active or narrow conversations, half width for wide empty conversations.
 */
export function getPromptlineFrameWidth(terminalWidth: number, hasMessages: boolean): number {
	const halfWidth = Math.max(1, Math.floor(terminalWidth / 2));
	if (hasMessages || halfWidth < 60) return terminalWidth;
	return halfWidth;
}
