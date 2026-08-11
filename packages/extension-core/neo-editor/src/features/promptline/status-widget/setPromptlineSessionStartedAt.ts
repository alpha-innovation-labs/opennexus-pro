import { PROMPTLINE_SESSION_STARTED_AT_KEY } from "./sessionStartedAtKey";

/**
 * Stores the timestamp for the current promptline session.
 *
 * @param timestamp Session start timestamp.
 */
export function setPromptlineSessionStartedAt(timestamp: number): void {
	(globalThis as unknown as Record<string, number>)[
		PROMPTLINE_SESSION_STARTED_AT_KEY
	] = timestamp;
}
