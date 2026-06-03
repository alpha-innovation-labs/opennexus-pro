import type { SteerQueueItem } from "./types.js";

/**
 * Serializes one steering queue item as a JSONL row.
 *
 * @param item Queue item to serialize.
 * @returns JSONL row including trailing newline.
 */
export function serializeSteerQueueItem(item: SteerQueueItem): string {
  return `${JSON.stringify(item)}\n`;
}
