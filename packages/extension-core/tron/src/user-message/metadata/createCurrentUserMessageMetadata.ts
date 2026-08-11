import type { UserMessageMetadata } from "./types";

/**
 * Creates timestamp metadata for a live user message.
 *
 * @param message User message emitted by the agent.
 * @returns Metadata for rendering the message timestamp.
 */
export function createCurrentUserMessageMetadata(
	message: unknown,
): UserMessageMetadata {
	return {
		timestamp: message?.timestamp,
	};
}
