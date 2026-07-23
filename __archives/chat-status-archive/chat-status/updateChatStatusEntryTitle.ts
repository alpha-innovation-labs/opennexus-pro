import { pruneChatStatusEntries } from "./pruneChatStatusEntries.js";
import type { ChatStatusFile } from "./types.js";

/**
 * Updates one active-chat title in a chat-status document.
 *
 * @param file Existing chat-status document.
 * @param entryId Entry id to update.
 * @param sessionTitle Latest session title.
 * @returns Updated chat-status document.
 */
export function updateChatStatusEntryTitle(file: ChatStatusFile, entryId: string, sessionTitle: string): ChatStatusFile {
  const normalizedTitle = sessionTitle.replace(/\s+/g, " ").trim();
  const entries = pruneChatStatusEntries(file.entries).map((entry) => {
    if (entry.id !== entryId) return entry;
    return { ...entry, sessionTitle: normalizedTitle || undefined, updatedAt: new Date().toISOString() };
  });
  return { version: 1, entries };
}
