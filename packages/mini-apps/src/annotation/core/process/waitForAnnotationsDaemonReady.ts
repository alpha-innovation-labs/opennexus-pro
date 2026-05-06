import { getAnnotationsDaemonStatus } from "../commands/getAnnotationsDaemonStatus.js";
import type { AnnotationsDaemonStatus } from "../state/types.js";
import { isAnnotationsDaemonHttpReady } from "./isAnnotationsDaemonHttpReady.js";

/**
 * Waits until the annotations daemon heartbeat reports running.
 *
 * @param timeoutMs Max wait time in milliseconds.
 * @returns Running daemon status.
 */
export async function waitForAnnotationsDaemonReady(timeoutMs: number): Promise<AnnotationsDaemonStatus> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const status = await getAnnotationsDaemonStatus();
    if (status.running && await isAnnotationsDaemonHttpReady()) return status;
    if (Date.now() > deadline) throw new Error("Annotations daemon did not become ready in time");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
