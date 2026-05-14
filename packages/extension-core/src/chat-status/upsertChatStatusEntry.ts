import { pruneChatStatusEntries } from "./pruneChatStatusEntries.js";
import type { ChatStatusEntry, ChatStatusFile } from "./types.js";

/**
 * Adds or replaces one active-chat entry in a chat-status document.
 *
 * @param file Existing chat-status document.
 * @param entry Entry to add or replace.
 * @returns Updated chat-status document.
 */
export function upsertChatStatusEntry(file: ChatStatusFile, entry: ChatStatusEntry): ChatStatusFile {
  const entries = pruneChatStatusEntries(file.entries).filter((candidate) => candidate.id !== entry.id);
  return { version: 1, entries: [...entries, entry] };
}
