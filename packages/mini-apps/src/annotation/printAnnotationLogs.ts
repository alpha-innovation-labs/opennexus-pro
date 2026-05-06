import { readAnnotationsDaemonLogTail } from "./core/logs/readAnnotationsDaemonLogTail.js";

const DEFAULT_LOG_LINES = 80;

/**
 * Prints the annotation daemon log path and recent lines.
 */
export async function printAnnotationLogs(): Promise<void> {
	const { path, text } = await readAnnotationsDaemonLogTail(DEFAULT_LOG_LINES);
	console.log(`annotation daemon log: ${path}`);
	console.log(text || "<empty>");
}
