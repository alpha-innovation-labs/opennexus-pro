import { getPersistentConversationId } from "../shared/getPersistentConversationId";

/**
 * Resolves the active conversation identifier.
 *
 * @param sessionFile Session file path.
 * @param ephemeralConversationId Ephemeral fallback identifier.
 * @returns Active conversation identifier.
 */
export function getTrackedConversationId(
	sessionFile: string | null,
	ephemeralConversationId: string,
): string {
	return sessionFile ? getPersistentConversationId(sessionFile) : ephemeralConversationId;
}
