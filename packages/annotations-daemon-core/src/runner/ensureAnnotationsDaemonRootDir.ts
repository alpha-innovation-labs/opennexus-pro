import { mkdir } from "node:fs/promises";
import { getAnnotationsDaemonRootPath } from "../paths/getAnnotationsDaemonRootPath.js";

/**
 * Ensures the annotations daemon storage directory exists.
 */
export async function ensureAnnotationsDaemonRootDir(): Promise<void> {
  await mkdir(getAnnotationsDaemonRootPath(), { recursive: true });
}
