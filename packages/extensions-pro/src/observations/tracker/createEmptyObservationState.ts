import type { ObservationState } from "./types.js";

/**
 * Creates an empty structured observations state.
 *
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Empty observations state.
 */
export function createEmptyObservationState(
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): ObservationState {
	return {
		conversationId,
		cwd,
		sessionFile,
		updatedAt: Date.now(),
		messageCount: 0,
		summary: "",
		topics: [],
	};
}
