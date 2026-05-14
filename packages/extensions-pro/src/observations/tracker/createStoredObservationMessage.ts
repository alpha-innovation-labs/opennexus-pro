import type { ObservationState, StoredObservationMessage } from "./types.js";

/**
 * Creates one stored observation message and advances state message metadata.
 *
 * @param state Observation state receiving the message.
 * @param message Message fields captured from the session event.
 * @returns Stored observation message with an assigned index.
 */
export function createStoredObservationMessage(
	state: ObservationState,
	message: Omit<StoredObservationMessage, "index">,
): StoredObservationMessage {
	const index = (state.messageCount ?? 0) + 1;
	state.messageCount = index;
	return { index, ...message };
}
