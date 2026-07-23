import type { AnnotationsDaemonState } from "./types.js";

/**
 * Creates the daemon state document.
 *
 * @param pid Daemon process id.
 * @returns State document.
 */
export function createAnnotationsDaemonState(pid: number): AnnotationsDaemonState {
  return { pid, startedAt: new Date().toISOString() };
}
