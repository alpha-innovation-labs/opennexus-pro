import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { getAnnotationsDaemonStatePath } from "../paths/getAnnotationsDaemonStatePath.js";
import type { AnnotationsDaemonState } from "./types.js";

/**
 * Writes annotations daemon state to disk.
 *
 * @param state Daemon state document.
 */
export async function writeAnnotationsDaemonState(state: AnnotationsDaemonState): Promise<void> {
  const statePath = getAnnotationsDaemonStatePath();
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}
