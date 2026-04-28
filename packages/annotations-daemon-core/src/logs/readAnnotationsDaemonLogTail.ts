import { readFile } from "node:fs/promises";
import { getAnnotationsDaemonLogPath } from "../paths/getAnnotationsDaemonLogPath.js";

/**
 * Reads the last lines from the annotations daemon log file.
 *
 * @param lineCount Maximum line count to return.
 * @returns Log path and tail text.
 */
export async function readAnnotationsDaemonLogTail(lineCount: number): Promise<{ path: string; text: string }> {
  const path = getAnnotationsDaemonLogPath();
  try {
    const text = await readFile(path, "utf8");
    return { path, text: text.split("\n").slice(-lineCount).join("\n").trimEnd() };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { path, text: "" };
    throw error;
  }
}
