const BOLD = "\u001b[1m";
const PURPLE = "\u001b[35m";
const RESET = "\u001b[0m";

/**
 * Styles the resume command for terminal output.
 *
 * @param command Resume command.
 * @returns Bold purple command string.
 */
export function styleExitCommand(command: string): string {
	return `${BOLD}${PURPLE}${command}${RESET}`;
}

/**
 * Styles the session title for terminal output.
 *
 * @param title Session title.
 * @returns Bold title string.
 */
export function styleExitTitle(title: string): string {
	return `${BOLD}${title}${RESET}`;
}

/**
 * Styles box border text in purple.
 *
 * @param text Text to style.
 * @returns Purple text.
 */
export function styleExitBorder(text: string): string {
	return `${PURPLE}${text}${RESET}`;
}
