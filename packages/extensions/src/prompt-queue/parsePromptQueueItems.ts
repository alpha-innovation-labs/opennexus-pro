import type { PromptQueueItem } from "./types.js";

/**
 * Parses unknown JSON into valid prompt queue items.
 *
 * @param value Parsed JSON value.
 * @returns Valid prompt queue items.
 */
export function parsePromptQueueItems(value: unknown): PromptQueueItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is PromptQueueItem => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.id === "string" && typeof candidate.text === "string" && candidate.text.trim().length > 0 && typeof candidate.createdAt === "number";
  });
}
