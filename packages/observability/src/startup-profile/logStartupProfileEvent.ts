import { appendFileSync } from "node:fs";
import { isStartupProfileEnabled } from "./isStartupProfileEnabled";
import { safeSerialize } from "./safeSerialize";
import { startupProfileLogPath } from "./startupProfileLogPath";

/**
 * Appends one startup-profile event to the shared log.
 *
 * @param scope Logical scope name.
 * @param event Event name.
 * @param data Optional structured payload.
 */
export function logStartupProfileEvent(scope: string, event: string, data?: Record<string, unknown>): void {
	if (!isStartupProfileEnabled()) return;
	try {
		const line = {
			ts: new Date().toISOString(),
			scope,
			event,
			...(data ?? {}),
		};
		appendFileSync(startupProfileLogPath, `${safeSerialize(line)}\n`, "utf8");
	} catch {}
}
