import type { UserMessageMetadata } from "./types.ts";

/**
 * Creates timestamp metadata for a live user message.
 *
 * @param message User message emitted by the agent.
 * @returns Metadata for rendering the message timestamp.
 */
export function createCurrentUserMessageMetadata(message: any): UserMessageMetadata {
  return {
    timestamp: message?.timestamp,
  };
}
