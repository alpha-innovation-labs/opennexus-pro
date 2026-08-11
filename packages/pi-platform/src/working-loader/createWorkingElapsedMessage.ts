import { formatWorkingElapsed } from "./formatWorkingElapsed";

/**
 * Adds an elapsed-time prefix to a working loader message.
 *
 * @param message Original loader message.
 * @param elapsedMs Elapsed milliseconds.
 * @returns Message with stopwatch and elapsed time.
 */
export function createWorkingElapsedMessage(
	message: string,
	elapsedMs: number,
): string {
	return `⏱ ${formatWorkingElapsed(elapsedMs)} ${message}`;
}
