import { extractAssistantSummaryInput } from "@extensions/observations/tracker/extractAssistantSummaryInput";
import { extractUserText } from "@extensions/observations/tracker/extractUserText";
import type { StoredObservationMessage } from "@extensions/observations/tracker/types";
import { getSessionEntryTimestamp } from "./getSessionEntryTimestamp";
import { isSessionMessageEntry } from "./isSessionMessageEntry";

/**
 * Converts persisted session entries into stored observation messages.
 *
 * @param entries Raw session JSONL entries.
 * @returns Stored observation messages with session entry ids.
 */
export function createObservationMessagesFromSessionEntries(
	entries: readonly unknown[],
): StoredObservationMessage[] {
	const messages: StoredObservationMessage[] = [];
	for (const entry of entries) {
		if (!isSessionMessageEntry(entry)) continue;
		if (entry.message?.role === "user") {
			const text = extractUserText(entry.message);
			if (!text) continue;
			messages.push({
				index: messages.length + 1,
				entryId: entry.id,
				timestamp: getSessionEntryTimestamp(entry),
				role: "user",
				text,
			});
		}
		if (entry.message?.role === "assistant") {
			const summaryInput = extractAssistantSummaryInput(entry.message as never);
			if (!summaryInput.text && !summaryInput.thinking) continue;
			messages.push({
				index: messages.length + 1,
				entryId: entry.id,
				timestamp: getSessionEntryTimestamp(entry),
				role: "assistant",
				text: summaryInput.text,
				thinking: summaryInput.thinking,
			});
		}
	}
	return messages;
}
