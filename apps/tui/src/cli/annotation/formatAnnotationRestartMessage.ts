/**
 * Formats the annotation daemon restart result message.
 *
 * @param restarted Whether the daemon process changed.
 * @returns Human-readable restart message.
 */
export function formatAnnotationRestartMessage(restarted: boolean): string {
  return restarted ? "annotation daemon restarted" : "annotation daemon already running";
}
