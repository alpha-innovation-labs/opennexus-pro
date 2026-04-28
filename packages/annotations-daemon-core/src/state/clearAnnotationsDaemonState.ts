import { rm } from "node:fs/promises";
import { getAnnotationsDaemonHeartbeatPath } from "../paths/getAnnotationsDaemonHeartbeatPath.js";
import { getAnnotationsDaemonStatePath } from "../paths/getAnnotationsDaemonStatePath.js";

/**
 * Clears daemon lifecycle files from disk.
 */
export async function clearAnnotationsDaemonState(): Promise<void> {
  await Promise.all([
    rm(getAnnotationsDaemonStatePath(), { force: true }),
    rm(getAnnotationsDaemonHeartbeatPath(), { force: true }),
  ]);
}
