import { readFile } from "node:fs/promises";
import { getGatewayHeartbeatPath } from "../paths/getGatewayHeartbeatPath.js";

/**
 * Reads the latest gateway heartbeat timestamp.
 *
 * @returns Heartbeat ISO timestamp or undefined when unavailable.
 */
export async function readGatewayHeartbeat(): Promise<string | undefined> {
  try {
    return await readFile(getGatewayHeartbeatPath(), "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}
