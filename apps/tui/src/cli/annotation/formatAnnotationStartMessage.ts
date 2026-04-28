/**
 * Formats the annotation daemon start result message.
 *
 * @param started Whether a new daemon was started.
 * @returns Human-readable start message.
 */
export function formatAnnotationStartMessage(started: boolean): string {
  return started ? "annotation daemon started" : "annotation daemon already running";
}
