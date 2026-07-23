/**
 * Formats the annotation daemon start result message.
 *
 * @param started Whether the daemon was started by this command.
 * @returns User-facing result message.
 */
export function formatAnnotationStartMessage(started: boolean): string {
	return started ? "annotation daemon started" : "annotation daemon already running";
}
