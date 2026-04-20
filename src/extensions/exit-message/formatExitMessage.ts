/**
 * Formats the exit message for the current session title.
 *
 * @param title Current session title.
 * @returns User-facing exit message.
 */
export function formatExitMessage(title: string | undefined): string {
	const sessionTitle = title?.trim() || "Untitled session";
	return `Session title: ${sessionTitle}`;
}
