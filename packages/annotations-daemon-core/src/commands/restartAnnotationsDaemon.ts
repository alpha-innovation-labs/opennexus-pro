import { startAnnotationsDaemon } from "./startAnnotationsDaemon.js";
import { stopAnnotationsDaemon } from "./stopAnnotationsDaemon.js";
import type { AnnotationsDaemonStatus } from "../state/types.js";

export interface RestartAnnotationsDaemonResult {
  restarted: boolean;
  status: AnnotationsDaemonStatus;
}

/**
 * Restarts the annotations daemon.
 *
 * @returns Restart result and resulting status.
 */
export async function restartAnnotationsDaemon(): Promise<RestartAnnotationsDaemonResult> {
  const stopped = await stopAnnotationsDaemon();
  const started = await startAnnotationsDaemon();
  return { restarted: stopped.stopped || started.started, status: started.status };
}
