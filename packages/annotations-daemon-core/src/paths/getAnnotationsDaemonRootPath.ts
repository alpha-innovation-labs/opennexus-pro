import { join } from "node:path";
import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";

/**
 * Resolves the Nexus annotations daemon storage directory.
 *
 * @returns Absolute annotations daemon directory path.
 */
export function getAnnotationsDaemonRootPath(): string {
  return join(getAgentDirPath(), "annotations-daemon");
}
