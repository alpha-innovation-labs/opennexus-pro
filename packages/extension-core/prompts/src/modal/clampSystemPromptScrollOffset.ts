/**
 * Clamps the prompt scroll offset to the available line range.
 *
 * @param offset Requested scroll offset.
 * @param lineCount Total rendered line count.
 * @param viewportHeight Visible prompt row count.
 * @returns Safe scroll offset.
 */
export function clampSystemPromptScrollOffset(
	offset: number,
	lineCount: number,
	viewportHeight: number,
): number {
	const maxOffset = Math.max(0, lineCount - Math.max(1, viewportHeight));
	return Math.min(Math.max(0, offset), maxOffset);
}
