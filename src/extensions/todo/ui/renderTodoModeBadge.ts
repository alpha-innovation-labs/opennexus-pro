/**
 * Renders the current todo mode as a fixed dark-red badge.
 *
 * @param mode Current todo mode label.
 * @returns Styled mode badge.
 */
export function renderTodoModeBadge(mode: string): string {
	return `\x1b[38;2;255;255;255m\x1b[48;2;214;86;86m ${mode.toUpperCase()} \x1b[0m`;
}
