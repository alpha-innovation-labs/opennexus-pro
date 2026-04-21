import { clearGatewayState } from "../state/clearGatewayState.js";
import { createGatewayState } from "../state/createGatewayState.js";
import { writeGatewayState } from "../state/writeGatewayState.js";
import { ensureGatewayRootDir } from "./ensureGatewayRootDir.js";
import { runGatewayServices } from "./runGatewayServices.js";
import { writeGatewayHeartbeat } from "./writeGatewayHeartbeat.js";

const HEARTBEAT_INTERVAL_MS = 1000;

/**
 * Runs the long-lived adapter gateway daemon.
 *
 * @returns A promise that resolves when the daemon shuts down.
 */
export async function runGatewayDaemon(): Promise<void> {
  await ensureGatewayRootDir();
  await writeGatewayState(createGatewayState(process.pid));
  await writeGatewayHeartbeat();

  let stopping = false;
  const timer = setInterval(() => {
    void writeGatewayHeartbeat();
  }, HEARTBEAT_INTERVAL_MS);

  const shutdown = async () => {
    if (stopping) {
      return;
    }

    stopping = true;
    clearInterval(timer);
    await clearGatewayState();
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown();
  });
  process.on("SIGTERM", () => {
    void shutdown();
  });

  await runGatewayServices(() => stopping);
}
