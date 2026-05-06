import { isProcessAlive } from "../process/isProcessAlive.js";
import { readAnnotationsDaemonHeartbeat } from "../state/readAnnotationsDaemonHeartbeat.js";
import { readAnnotationsDaemonState } from "../state/readAnnotationsDaemonState.js";
import type { AnnotationsDaemonStatus } from "../state/types.js";

const STALE_HEARTBEAT_MS = 5000;

/**
 * Reads the current annotations daemon status.
 *
 * @returns Daemon status.
 */
export async function getAnnotationsDaemonStatus(): Promise<AnnotationsDaemonStatus> {
  const state = await readAnnotationsDaemonState();
  const heartbeat = await readAnnotationsDaemonHeartbeat();
  const heartbeatAt = heartbeat ? Date.parse(heartbeat.updatedAt) : 0;
  const heartbeatFresh = heartbeatAt > 0 && Date.now() - heartbeatAt <= STALE_HEARTBEAT_MS;
  const running = Boolean(state?.pid && heartbeatFresh && isProcessAlive(state.pid));

  return {
    running,
    pid: state?.pid,
    startedAt: state?.startedAt,
    heartbeatAt: heartbeat?.updatedAt,
  };
}
