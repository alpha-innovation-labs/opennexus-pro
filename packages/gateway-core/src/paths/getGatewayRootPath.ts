import { join } from "node:path";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";

/**
 * Resolves the Nexus gateway storage directory.
 *
 * @returns Absolute gateway directory path.
 */
export function getGatewayRootPath(): string {
  return join(getAgentDirPath(), "gateway");
}
