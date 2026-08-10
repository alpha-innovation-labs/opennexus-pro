/**
 * Reads the terminal row count used by the fullscreen system prompt modal.
 *
 * @returns Current terminal row count with a safe fallback.
 */
export function getDefaultSystemPromptModalRows(): number {
	return Math.max(1, process.stdout.rows || 40);
}
