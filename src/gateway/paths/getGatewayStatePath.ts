import { join } from "node:path";
import { getGatewayRootPath } from "./getGatewayRootPath.js";

/**
 * Resolves the persisted gateway state path.
 *
 * @returns Absolute gateway state file path.
 */
export function getGatewayStatePath(): string {
  return join(getGatewayRootPath(), "state.json");
}
