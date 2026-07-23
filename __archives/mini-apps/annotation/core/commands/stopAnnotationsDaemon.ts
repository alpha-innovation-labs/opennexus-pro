import { waitForProcessExit } from "../process/waitForProcessExit.js";
import { clearAnnotationsDaemonState } from "../state/clearAnnotationsDaemonState.js";
import type { AnnotationsDaemonStatus } from "../state/types.js";
import { getAnnotationsDaemonStatus } from "./getAnnotationsDaemonStatus.js";

export interface StopAnnotationsDaemonResult {
  stopped: boolean;
  status: AnnotationsDaemonStatus;
}

/**
 * Stops the annotations daemon when it is running.
 *
 * @returns Stop result and resulting status.
 */
export async function stopAnnotationsDaemon(): Promise<StopAnnotationsDaemonResult> {
  const status = await getAnnotationsDaemonStatus();
  if (!status.running || !status.pid) {
    await clearAnnotationsDaemonState();
    return { stopped: false, status: await getAnnotationsDaemonStatus() };
  }

  process.kill(status.pid, "SIGTERM");
  if (!(await waitForProcessExit(status.pid, 5000))) {
    process.kill(status.pid, "SIGKILL");
    await waitForProcessExit(status.pid, 2000);
  }

  await clearAnnotationsDaemonState();
  return { stopped: true, status: await getAnnotationsDaemonStatus() };
}
