import type { AnnotationsDaemonStatus } from "../state/types.js";

/**
 * Formats a single-line CLI summary for the annotations daemon.
 *
 * @param status Daemon status to format.
 * @returns Human-readable status summary.
 */
export function formatAnnotationsDaemonStatus(status: AnnotationsDaemonStatus): string {
  if (!status.running) return "annotation daemon stopped";
  return `annotation daemon running (pid ${String(status.pid)})`;
}
