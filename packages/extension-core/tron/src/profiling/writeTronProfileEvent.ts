import { appendFileSync } from "node:fs";
import { isTronProfilingEnabled } from "./isTronProfilingEnabled";
import { tronProfileLogPath } from "./tronProfileLogPath";

/**
 * Appends one Tron profiling event to the profiling log.
 *
 * @param event Event name.
 * @param data Structured profiling payload.
 */
export function writeTronProfileEvent(
	event: string,
	data: Record<string, unknown>,
): void {
	if (!isTronProfilingEnabled()) return;
	try {
		appendFileSync(
			tronProfileLogPath,
			`${JSON.stringify({ ts: new Date().toISOString(), event, ...data })}\n`,
			"utf8",
		);
	} catch {}
}
