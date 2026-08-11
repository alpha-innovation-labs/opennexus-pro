import { logStartupProfileEvent } from "./startup-profile/logStartupProfileEvent";
import { startupProfileLogPath } from "./startup-profile/startupProfileLogPath";

/**
 * Appends one extension lifecycle event to the startup debug log.
 *
 * @param extension Extension name.
 * @param event Event name.
 * @param data Optional structured event payload.
 */
export function logExtensionEvent(
	extension: string,
	event: string,
	data?: Record<string, unknown>,
): void {
	logStartupProfileEvent(extension, event, data);
}

export const LOG_PATH = startupProfileLogPath;
