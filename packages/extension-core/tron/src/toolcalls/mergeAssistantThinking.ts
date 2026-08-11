/**
 * Merges carried and current assistant thinking into one display block.
 *
 * @param carried Thinking carried from prior assistant messages.
 * @param current Thinking from the current assistant message.
 * @returns Combined thinking text.
 */
export function mergeAssistantThinking(
	carried: string,
	current: string,
): string {
	if (!carried) return current;
	if (!current) return carried;
	if (carried === current) return current;
	return `${carried}\n\n${current}`.trim();
}
