import { join } from "node:path";
import { getAnnotationsDaemonRootPath } from "./getAnnotationsDaemonRootPath.js";

/**
 * Resolves the annotations daemon heartbeat-file path.
 *
 * @returns Absolute heartbeat JSON path.
 */
export function getAnnotationsDaemonHeartbeatPath(): string {
  return join(getAnnotationsDaemonRootPath(), "heartbeat.json");
}
