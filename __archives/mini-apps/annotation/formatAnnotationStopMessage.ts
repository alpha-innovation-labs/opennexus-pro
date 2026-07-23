/**
 * Formats the annotation daemon stop result message.
 *
 * @param stopped Whether the daemon was stopped by this command.
 * @returns User-facing result message.
 */
export function formatAnnotationStopMessage(stopped: boolean): string {
	return stopped ? "annotation daemon stopped" : "annotation daemon was not running";
}
