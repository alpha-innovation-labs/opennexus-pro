import { join } from "node:path";
import { getAnnotationsDaemonRootPath } from "./getAnnotationsDaemonRootPath.js";

/**
 * Resolves the durable annotation conversations store path.
 *
 * @returns Absolute JSON store path.
 */
export function getAnnotationConversationsStorePath(): string {
  return join(getAnnotationsDaemonRootPath(), "annotation-conversations.json");
}
