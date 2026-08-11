import { PROMPTLINE_SESSION_STARTED_AT_KEY } from "./sessionStartedAtKey";

/**
 * Reads the timestamp for the current promptline session.
 *
 * @returns Session start timestamp.
 */
export function getPromptlineSessionStartedAt(): number {
	return (
		(globalThis as unknown as Record<string, number | undefined>)[
			PROMPTLINE_SESSION_STARTED_AT_KEY
		] ?? Date.now()
	);
}
