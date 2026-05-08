import type { PromptQueueItem } from "./types.js";

/**
 * Creates one prompt queue item with a stable local identifier.
 *
 * @param text Prompt text to store.
 * @param now Timestamp provider for deterministic tests.
 * @returns Prompt queue item.
 */
export function createPromptQueueItem(text: string, now = Date.now): PromptQueueItem {
  const createdAt = now();
  const suffix = Math.random().toString(36).slice(2, 10);
  return { id: `${createdAt}-${suffix}`, text, createdAt };
}
