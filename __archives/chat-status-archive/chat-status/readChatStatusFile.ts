import { readFile } from "node:fs/promises";
import { createEmptyChatStatusFile } from "./createEmptyChatStatusFile.js";
import { pruneChatStatusEntries } from "./pruneChatStatusEntries.js";
import type { ChatStatusEntry, ChatStatusFile } from "./types.js";

/**
 * Reads the chat-status file, returning an empty document when it is absent or invalid.
 *
 * @param filePath Chat-status file path.
 * @returns Parsed chat-status content with stale entries pruned.
 */
export async function readChatStatusFile(filePath: string): Promise<ChatStatusFile> {
  try {
    const value = JSON.parse(await readFile(filePath, "utf8")) as Partial<ChatStatusFile>;
    const entries = Array.isArray(value.entries)
      ? value.entries.filter((entry): entry is ChatStatusEntry => (
        typeof entry?.id === "string" &&
        typeof entry.sessionId === "string" &&
        typeof entry.pid === "number"
      ))
      : [];
    return { version: 1, entries: pruneChatStatusEntries(entries) };
  } catch {
    return createEmptyChatStatusFile();
  }
}
