import type { ObservationMessageStore } from "./types";

/**
 * Creates an empty raw observation message store.
 *
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Empty message store.
 */
export function createEmptyObservationMessageStore(
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): ObservationMessageStore {
	return {
		conversationId,
		cwd,
		sessionFile,
		updatedAt: Date.now(),
		messages: [],
	};
}
