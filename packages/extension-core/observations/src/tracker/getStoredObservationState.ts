import { readObservationState } from "./readObservationState";
import type { ObservationState } from "./types";

/**
 * Reads the stored observation state using the current path tuple.
 *
 * @param statePath Observation state path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Stored observation state.
 */
export async function getStoredObservationState(
	statePath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): Promise<ObservationState> {
	return readObservationState(statePath, conversationId, cwd, sessionFile);
}
