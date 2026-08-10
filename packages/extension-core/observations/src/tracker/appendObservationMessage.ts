import { withFileMutationQueue } from "@earendil-works/pi-coding-agent";
import { writeFile } from "node:fs/promises";
import { readObservationMessageStore } from "./readObservationMessageStore";
import type { StoredObservationMessage } from "./types";

/**
 * Appends one raw tracked message to the observation store.
 *
 * @param messagesPath Raw messages path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @param nextMessage Raw message payload.
 * @returns Stored message with assigned index.
 */
export async function appendObservationMessage(
	messagesPath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
	nextMessage: Omit<StoredObservationMessage, "index">,
): Promise<StoredObservationMessage> {
	return withFileMutationQueue(messagesPath, async () => {
		const store = await readObservationMessageStore(messagesPath, conversationId, cwd, sessionFile);
		const storedMessage: StoredObservationMessage = {
			index: store.messages.length + 1,
			...nextMessage,
		};
		store.messages.push(storedMessage);
		store.updatedAt = Date.now();
		store.sessionFile = sessionFile;
		await writeFile(messagesPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
		return storedMessage;
	});
}
