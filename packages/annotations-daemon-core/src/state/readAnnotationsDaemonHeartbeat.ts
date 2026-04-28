import { readFile } from "node:fs/promises";
import { getAnnotationsDaemonHeartbeatPath } from "../paths/getAnnotationsDaemonHeartbeatPath.js";
import type { AnnotationsDaemonHeartbeat } from "./types.js";

/**
 * Reads annotations daemon heartbeat from disk.
 *
 * @returns Heartbeat document, or null when absent.
 */
export async function readAnnotationsDaemonHeartbeat(): Promise<AnnotationsDaemonHeartbeat | null> {
  try {
    return JSON.parse(await readFile(getAnnotationsDaemonHeartbeatPath(), "utf8")) as AnnotationsDaemonHeartbeat;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
