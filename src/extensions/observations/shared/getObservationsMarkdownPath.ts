import { resolve } from "node:path";
import { getObservationsDir } from "./getObservationsDir.js";

/**
 * Resolves the rendered observations markdown path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute observations markdown path.
 */
export function getObservationsMarkdownPath(conversationId: string): string {
	return resolve(getObservationsDir(), `${conversationId}.observations.md`);
}
