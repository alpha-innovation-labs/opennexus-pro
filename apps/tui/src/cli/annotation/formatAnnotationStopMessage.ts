/**
 * Formats the annotation daemon stop result message.
 *
 * @param stopped Whether a running daemon was stopped.
 * @returns Human-readable stop message.
 */
export function formatAnnotationStopMessage(stopped: boolean): string {
  return stopped ? "annotation daemon stopped" : "annotation daemon was not running";
}
