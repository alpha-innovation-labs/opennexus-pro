import { resolve } from "node:path";
import { getObservationsDir } from "./getObservationsDir.js";

/**
 * Resolves the raw stored observation messages path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute raw messages path.
 */
export function getObservationMessagesPath(conversationId: string): string {
	return resolve(getObservationsDir(), `${conversationId}.messages.json`);
}
