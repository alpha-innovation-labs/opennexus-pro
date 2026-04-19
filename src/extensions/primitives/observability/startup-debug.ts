import { appendFileSync } from "node:fs";

const LOG_PATH = "/tmp/pi-extension-startup.log";

/**
 * Safely serializes a value for log output.
 *
 * @param value Value to serialize.
 * @returns JSON-safe string.
 */
function safe(value: unknown): string {
	try {
		return JSON.stringify(value);
	} catch {
		return JSON.stringify(String(value));
	}
}

/**
 * Appends one extension lifecycle event to the startup debug log.
 *
 * @param extension Extension name.
 * @param event Event name.
 * @param data Optional structured event payload.
 */
export function logExtensionEvent(extension: string, event: string, data?: Record<string, unknown>): void {
	try {
		const line = {
			ts: new Date().toISOString(),
			extension,
			event,
			...(data ?? {}),
		};
		appendFileSync(LOG_PATH, `${safe(line)}\n`, "utf8");
	} catch {}
}

export { LOG_PATH };
