import { listBuiltInAdapters } from "../../adapters/shared/listBuiltInAdapters.js";
import { getGatewayLogPath } from "../paths/getGatewayLogPath.js";
import type { GatewayState } from "./types.js";

/**
 * Creates the persisted state for a running gateway process.
 *
 * @param pid Running gateway process id.
 * @returns Gateway state snapshot.
 */
export function createGatewayState(pid: number): GatewayState {
  const now = new Date().toISOString();

  return {
    pid,
    startedAt: now,
    heartbeatAt: now,
    logPath: getGatewayLogPath(),
    adapters: listBuiltInAdapters(),
  };
}
