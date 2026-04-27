import { clearGatewayState } from "../state/clearGatewayState.js";
import { waitForProcessExit } from "../process/waitForProcessExit.js";
import { getGatewayStatus } from "./getGatewayStatus.js";
import type { GatewayStatus } from "../state/types.js";

export interface StopGatewayResult {
  stopped: boolean;
  status: GatewayStatus;
}

/**
 * Stops the gateway when it is running.
 *
 * @returns Stop result and resulting status.
 */
export async function stopGateway(): Promise<StopGatewayResult> {
  const status = await getGatewayStatus();
  if (!status.running || !status.pid) {
    await clearGatewayState();
    return {
      stopped: false,
      status: await getGatewayStatus(),
    };
  }

  process.kill(status.pid, "SIGTERM");
  if (!(await waitForProcessExit(status.pid, 5000))) {
    process.kill(status.pid, "SIGKILL");
    await waitForProcessExit(status.pid, 2000);
  }

  await clearGatewayState();
  return {
    stopped: true,
    status: await getGatewayStatus(),
  };
}
