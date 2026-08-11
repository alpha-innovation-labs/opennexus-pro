/**
 * Normalizes edited session-name text into one slash-command argument.
 *
 * @param value Raw editor result.
 * @returns Single-line session name.
 */
export function sanitizeSessionNameInput(value: string): string {
	return value.replace(/[\r\n]+/g, " ").trim();
}
