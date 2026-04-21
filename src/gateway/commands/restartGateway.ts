import { startGateway } from "./startGateway.js";
import type { GatewayStatus } from "../state/types.js";
import { stopGateway } from "./stopGateway.js";

export interface RestartGatewayResult {
  restarted: boolean;
  status: GatewayStatus;
}

/**
 * Restarts the adapter gateway.
 *
 * @returns Restart result and resulting status.
 */
export async function restartGateway(): Promise<RestartGatewayResult> {
  await stopGateway();
  const started = await startGateway();

  return {
    restarted: true,
    status: started.status,
  };
}
