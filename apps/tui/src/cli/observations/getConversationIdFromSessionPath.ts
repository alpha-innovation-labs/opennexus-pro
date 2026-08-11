import { basename } from "node:path";

/**
 * Converts a persisted session path into the matching observation conversation id.
 *
 * @param sessionPath Persisted session JSONL path.
 * @returns Observation conversation id.
 */
export function getConversationIdFromSessionPath(sessionPath: string): string {
	return basename(sessionPath).replace(/\.jsonl$/, "");
}
