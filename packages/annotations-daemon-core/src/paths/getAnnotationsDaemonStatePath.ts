import { join } from "node:path";
import { getAnnotationsDaemonRootPath } from "./getAnnotationsDaemonRootPath.js";

/**
 * Resolves the annotations daemon state-file path.
 *
 * @returns Absolute state JSON path.
 */
export function getAnnotationsDaemonStatePath(): string {
  return join(getAnnotationsDaemonRootPath(), "state.json");
}
