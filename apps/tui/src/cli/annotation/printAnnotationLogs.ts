import { readAnnotationsDaemonLogTail } from "@nexus/annotations-daemon-core/logs/readAnnotationsDaemonLogTail.js";

const DEFAULT_LOG_LINES = 80;

/**
 * Prints the annotations daemon log path and recent lines.
 */
export async function printAnnotationLogs(): Promise<void> {
  const { path, text } = await readAnnotationsDaemonLogTail(DEFAULT_LOG_LINES);
  console.log(`annotation daemon log: ${path}`);
  console.log(text || "<empty>");
}
