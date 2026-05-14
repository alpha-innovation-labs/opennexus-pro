import { pruneChatStatusEntries } from "./pruneChatStatusEntries.js";
import type { ChatStatusFile } from "./types.js";

/**
 * Removes one active-chat entry from a chat-status document.
 *
 * @param file Existing chat-status document.
 * @param entryId Entry id to remove.
 * @returns Updated chat-status document.
 */
export function removeChatStatusEntry(file: ChatStatusFile, entryId: string): ChatStatusFile {
  return { version: 1, entries: pruneChatStatusEntries(file.entries).filter((entry) => entry.id !== entryId) };
}
