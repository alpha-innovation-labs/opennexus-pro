/**
 * Normalizes title text for one-line status rendering.
 *
 * @param text Raw title text.
 * @returns Trimmed single-line text, or undefined when empty.
 */
export function normalizePromptlineTitleText(text: string): string | undefined {
	const normalized = text
		.replace(/[\r\n]+/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return normalized ? normalized : undefined;
}
