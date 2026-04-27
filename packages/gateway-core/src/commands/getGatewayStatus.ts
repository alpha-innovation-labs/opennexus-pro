import { listBuiltInAdapters } from "@nexus/social-adapters/shared/listBuiltInAdapters.js";
import { isProcessAlive } from "../process/isProcessAlive.js";
import { readGatewayHeartbeat } from "../state/readGatewayHeartbeat.js";
import { readGatewayState } from "../state/readGatewayState.js";
import type { GatewayStatus } from "../state/types.js";

/**
 * Reads the current gateway status.
 *
 * @returns Gateway runtime status.
 */
export async function getGatewayStatus(): Promise<GatewayStatus> {
  const state = await readGatewayState();
  if (!state) {
    return {
      running: false,
      adapters: listBuiltInAdapters(),
    };
  }

  if (!isProcessAlive(state.pid)) {
    return {
      running: false,
      logPath: state.logPath,
      adapters: state.adapters,
    };
  }

  return {
    running: true,
    pid: state.pid,
    startedAt: state.startedAt,
    heartbeatAt: (await readGatewayHeartbeat())?.trim() || state.heartbeatAt,
    logPath: state.logPath,
    adapters: state.adapters,
  };
}
