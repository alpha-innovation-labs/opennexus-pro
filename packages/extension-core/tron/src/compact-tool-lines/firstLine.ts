/**
 * Returns the first trimmed line from text.
 *
 * @param text Input text.
 * @returns First line.
 */
export function firstLine(text: string | undefined | null): string {
	if (!text) return "";
	return text.replace(/\r\n/g, "\n").split("\n")[0]?.trim() ?? "";
}
