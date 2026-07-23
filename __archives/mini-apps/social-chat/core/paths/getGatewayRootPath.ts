import { join } from "node:path";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";

/**
 * Resolves the Nexus social chat storage directory.
 *
 * @returns Absolute social chat directory path.
 */
export function getGatewayRootPath(): string {
  return join(getAgentDirPath(), "social-chat");
}
