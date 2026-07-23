const SESSION_STARTED_AT_KEY = "__observations_session_started_at__";

/**
 * Stores the timestamp for the current session start.
 *
 * @param timestamp Session start timestamp.
 */
export function setSessionStartedAt(timestamp: number): void {
	(globalThis as unknown as Record<string, number>)[SESSION_STARTED_AT_KEY] = timestamp;
}
