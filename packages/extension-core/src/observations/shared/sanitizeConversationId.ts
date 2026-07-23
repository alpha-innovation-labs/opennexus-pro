/**
 * Converts a session-derived identifier into a filesystem-safe value.
 *
 * @param value Raw identifier.
 * @returns Sanitized identifier.
 */
export function sanitizeConversationId(value: string): string {
	return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}
