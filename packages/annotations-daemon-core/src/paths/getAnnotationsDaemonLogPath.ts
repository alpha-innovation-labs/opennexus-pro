import { join } from "node:path";
import { getAnnotationsDaemonRootPath } from "./getAnnotationsDaemonRootPath.js";

/**
 * Resolves the annotations daemon log-file path.
 *
 * @returns Absolute daemon log path.
 */
export function getAnnotationsDaemonLogPath(): string {
  return join(getAnnotationsDaemonRootPath(), "daemon.log");
}
