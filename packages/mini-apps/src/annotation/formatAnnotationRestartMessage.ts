/**
 * Formats the annotation daemon restart result message.
 *
 * @param restarted Whether the daemon was restarted by this command.
 * @returns User-facing result message.
 */
export function formatAnnotationRestartMessage(restarted: boolean): string {
	return restarted ? "annotation daemon restarted" : "annotation daemon already running";
}
