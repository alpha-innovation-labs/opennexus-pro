import type { ChatStatusFile } from "./types.js";

/**
 * Creates an empty chat-status document.
 *
 * @returns Empty chat-status file content.
 */
export function createEmptyChatStatusFile(): ChatStatusFile {
  return { version: 1, entries: [] };
}
