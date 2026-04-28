import { readFile } from "node:fs/promises";
import { getAnnotationsDaemonStatePath } from "../paths/getAnnotationsDaemonStatePath.js";
import type { AnnotationsDaemonState } from "./types.js";

/**
 * Reads annotations daemon state from disk.
 *
 * @returns State document, or null when absent.
 */
export async function readAnnotationsDaemonState(): Promise<AnnotationsDaemonState | null> {
  try {
    return JSON.parse(await readFile(getAnnotationsDaemonStatePath(), "utf8")) as AnnotationsDaemonState;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
