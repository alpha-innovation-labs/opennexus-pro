import { writeFile } from "node:fs/promises";
import { getGatewayHeartbeatPath } from "../paths/getGatewayHeartbeatPath.js";

/**
 * Writes the latest gateway heartbeat timestamp.
 *
 * @returns A promise that resolves after the heartbeat is updated.
 */
export async function writeGatewayHeartbeat(): Promise<void> {
  await writeFile(getGatewayHeartbeatPath(), new Date().toISOString(), "utf8");
}
