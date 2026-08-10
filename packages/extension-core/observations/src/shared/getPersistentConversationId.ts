import { basename } from "node:path";
import { sanitizeConversationId } from "./sanitizeConversationId";

/**
 * Builds a stable conversation identifier from a persisted session path.
 *
 * @param sessionFile Session file path.
 * @returns Stable conversation identifier.
 */
export function getPersistentConversationId(sessionFile: string): string {
	return sanitizeConversationId(basename(sessionFile).replace(/\.jsonl$/, ""));
}
