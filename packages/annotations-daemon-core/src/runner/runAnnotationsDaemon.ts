import { clearAnnotationsDaemonState } from "../state/clearAnnotationsDaemonState.js";
import { createAnnotationsDaemonState } from "../state/createAnnotationsDaemonState.js";
import { writeAnnotationsDaemonState } from "../state/writeAnnotationsDaemonState.js";
import { ensureAnnotationsDaemonRootDir } from "./ensureAnnotationsDaemonRootDir.js";
import { runAnnotationsDaemonServices } from "./runAnnotationsDaemonServices.js";
import { writeAnnotationsDaemonHeartbeat } from "./writeAnnotationsDaemonHeartbeat.js";

const HEARTBEAT_INTERVAL_MS = 1000;

/**
 * Runs the long-lived annotations daemon.
 */
export async function runAnnotationsDaemon(): Promise<void> {
  await ensureAnnotationsDaemonRootDir();
  await writeAnnotationsDaemonState(createAnnotationsDaemonState(process.pid));
  await writeAnnotationsDaemonHeartbeat();

  let stopping = false;
  const timer = setInterval(() => void writeAnnotationsDaemonHeartbeat(), HEARTBEAT_INTERVAL_MS);
  const shutdown = async (): Promise<void> => {
    if (stopping) return;
    stopping = true;
    clearInterval(timer);
    await clearAnnotationsDaemonState();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
  await runAnnotationsDaemonServices(() => stopping);
}
