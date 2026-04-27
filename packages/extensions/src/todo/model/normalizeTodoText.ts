/**
 * Converts editor content into a single-line todo label.
 *
 * @param text Raw editor text.
 * @returns Normalized todo text.
 */
export function normalizeTodoText(text: string): string {
	return text.replace(/\s*\n\s*/g, " ").trim();
}
