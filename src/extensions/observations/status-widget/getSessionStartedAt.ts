const SESSION_STARTED_AT_KEY = "__observations_session_started_at__";

/**
 * Reads the timestamp for the current session start.
 *
 * @returns Session start timestamp.
 */
export function getSessionStartedAt(): number {
	return (globalThis as unknown as Record<string, number | undefined>)[SESSION_STARTED_AT_KEY] ?? Date.now();
}
