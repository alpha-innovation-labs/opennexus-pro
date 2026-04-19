/**
 * Creates a fresh ephemeral conversation identifier.
 *
 * @returns Ephemeral conversation identifier.
 */
export function createEphemeralConversationId(): string {
	return `ephemeral-${Date.now()}`;
}
