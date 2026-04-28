import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getAnnotationsDaemonHeartbeatPath } from "../paths/getAnnotationsDaemonHeartbeatPath.js";

/**
 * Writes the annotations daemon heartbeat file.
 */
export async function writeAnnotationsDaemonHeartbeat(): Promise<void> {
  const heartbeatPath = getAnnotationsDaemonHeartbeatPath();
  await mkdir(dirname(heartbeatPath), { recursive: true });
  await writeFile(heartbeatPath, `${JSON.stringify({ pid: process.pid, updatedAt: new Date().toISOString() }, null, 2)}\n`, "utf8");
}
