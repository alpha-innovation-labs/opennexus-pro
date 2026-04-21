import { spawnGatewayProcess } from "../process/spawnGatewayProcess.js";
import { waitForGatewayReady } from "../process/waitForGatewayReady.js";
import { ensureGatewayRootDir } from "../runner/ensureGatewayRootDir.js";
import type { GatewayStatus } from "../state/types.js";
import { getGatewayStatus } from "./getGatewayStatus.js";

export interface StartGatewayResult {
  started: boolean;
  status: GatewayStatus;
}

/**
 * Starts the adapter gateway when it is not already running.
 *
 * @returns Start result and resulting status.
 */
export async function startGateway(): Promise<StartGatewayResult> {
  const currentStatus = await getGatewayStatus();
  if (currentStatus.running) {
    return {
      started: false,
      status: currentStatus,
    };
  }

  await ensureGatewayRootDir();
  spawnGatewayProcess();

  return {
    started: true,
    status: await waitForGatewayReady(5000),
  };
}
