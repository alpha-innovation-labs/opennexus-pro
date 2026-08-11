import { resolve } from "node:path";
import { getObservationsDir } from "./getObservationsDir";

/**
 * Resolves the legacy structured observation state path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute legacy observation state path.
 */
export function getLegacyObservationStatePath(conversationId: string): string {
	return resolve(getObservationsDir(), `${conversationId}.state.json`);
}
