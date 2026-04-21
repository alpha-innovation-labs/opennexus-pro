import { rm } from "node:fs/promises";
import { getGatewayHeartbeatPath } from "../paths/getGatewayHeartbeatPath.js";
import { getGatewayStatePath } from "../paths/getGatewayStatePath.js";

/**
 * Deletes persisted gateway runtime files.
 *
 * @returns A promise that resolves after cleanup.
 */
export async function clearGatewayState(): Promise<void> {
  await rm(getGatewayStatePath(), { force: true });
  await rm(getGatewayHeartbeatPath(), { force: true });
}
