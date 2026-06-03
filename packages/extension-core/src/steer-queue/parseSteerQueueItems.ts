import type { SteerQueueItem } from "./types.js";

/**
 * Parses JSONL steering queue content into valid queue items.
 *
 * @param text Raw JSONL queue content.
 * @returns Valid steering queue items.
 */
export function parseSteerQueueItems(text: string): SteerQueueItem[] {
  const items: SteerQueueItem[] = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const value = JSON.parse(trimmed) as Partial<SteerQueueItem>;
      if (typeof value.id !== "string") continue;
      if (typeof value.sessionId !== "string") continue;
      if (typeof value.message !== "string" || !value.message.trim()) continue;
      if (typeof value.createdAt !== "string") continue;
      if (typeof value.pid !== "number") continue;
      items.push({ id: value.id, sessionId: value.sessionId, message: value.message, createdAt: value.createdAt, pid: value.pid });
    } catch {
      continue;
    }
  }
  return items;
}
