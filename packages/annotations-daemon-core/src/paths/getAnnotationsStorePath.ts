import { join } from "node:path";
import { getAnnotationsDaemonRootPath } from "./getAnnotationsDaemonRootPath.js";

/**
 * Resolves the durable annotation store path.
 *
 * @returns Absolute JSON store path.
 */
export function getAnnotationsStorePath(): string {
  return join(getAnnotationsDaemonRootPath(), "annotations.json");
}
