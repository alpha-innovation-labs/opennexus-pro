/**
 * Removes ANSI SGR escape sequences from text.
 *
 * @param text Input text.
 * @returns Plain text.
 */
export function stripAnsi(text: string): string {
	return text.replace(new RegExp("\\x1B\\[[0-9;]*m", "g"), "");
}
