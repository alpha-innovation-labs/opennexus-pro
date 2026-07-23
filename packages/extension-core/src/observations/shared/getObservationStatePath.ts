import { resolve } from "node:path";
import { getObservationsDir } from "./getObservationsDir.js";

/**
 * Resolves the structured observation artifact path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute observation state path.
 */
export function getObservationStatePath(conversationId: string): string {
	return resolve(getObservationsDir(), `${conversationId}.json`);
}
