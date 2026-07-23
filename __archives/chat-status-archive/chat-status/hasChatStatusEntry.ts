import type { ChatStatusFile } from "./types.js";

/**
 * Checks whether a chat-status document contains one entry id.
 *
 * @param file Chat-status document to inspect.
 * @param entryId Entry id to find.
 * @returns True when the entry exists.
 */
export function hasChatStatusEntry(file: ChatStatusFile, entryId: string): boolean {
  return file.entries.some((entry) => entry.id === entryId);
}
