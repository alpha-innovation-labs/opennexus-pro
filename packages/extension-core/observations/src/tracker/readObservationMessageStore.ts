import { readFile } from "node:fs/promises";
import { createEmptyObservationMessageStore } from "./createEmptyObservationMessageStore";
import type { ObservationMessageStore } from "./types";

/**
 * Reads the raw observation message store.
 *
 * @param messagesPath Raw messages path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Message store.
 */
export async function readObservationMessageStore(
	messagesPath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): Promise<ObservationMessageStore> {
	try {
		const content = await readFile(messagesPath, "utf8");
		const parsed = JSON.parse(content) as ObservationMessageStore;
		return {
			conversationId,
			cwd,
			sessionFile,
			updatedAt: parsed.updatedAt ?? Date.now(),
			messages: Array.isArray(parsed.messages) ? parsed.messages : [],
		};
	} catch {
		return createEmptyObservationMessageStore(conversationId, cwd, sessionFile);
	}
}
