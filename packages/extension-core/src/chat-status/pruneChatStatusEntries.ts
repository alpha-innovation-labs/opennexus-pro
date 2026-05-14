import { isProcessLive } from "./isProcessLive.js";
import type { ChatStatusEntry } from "./types.js";

/**
 * Removes chat-status entries whose owner process has exited.
 *
 * @param entries Chat-status entries to filter.
 * @returns Entries still owned by live processes.
 */
export function pruneChatStatusEntries(entries: ChatStatusEntry[]): ChatStatusEntry[] {
  return entries.filter((entry) => isProcessLive(entry.pid));
}
