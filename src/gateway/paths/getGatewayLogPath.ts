import { join } from "node:path";
import { getGatewayRootPath } from "./getGatewayRootPath.js";

/**
 * Resolves the gateway log file path.
 *
 * @returns Absolute gateway log file path.
 */
export function getGatewayLogPath(): string {
  return join(getGatewayRootPath(), "gateway.log");
}
