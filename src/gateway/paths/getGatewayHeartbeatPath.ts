import { join } from "node:path";
import { getGatewayRootPath } from "./getGatewayRootPath.js";

/**
 * Resolves the gateway heartbeat file path.
 *
 * @returns Absolute gateway heartbeat path.
 */
export function getGatewayHeartbeatPath(): string {
  return join(getGatewayRootPath(), "heartbeat.txt");
}
