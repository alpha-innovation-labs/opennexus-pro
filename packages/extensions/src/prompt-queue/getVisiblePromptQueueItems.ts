import type { PromptQueueItem } from "./types.js";

/**
 * Selects the visible window of queue items around the selected item.
 *
 * @param items Full queue item list.
 * @param selectedId Currently selected item id.
 * @param maxVisible Maximum visible item count.
 * @returns Queue items that should be rendered.
 */
export function getVisiblePromptQueueItems(
  items: PromptQueueItem[],
  selectedId: string | undefined,
  maxVisible: number,
): PromptQueueItem[] {
  if (items.length <= maxVisible) return items;
  const selectedIndex = Math.max(0, items.findIndex((item) => item.id === selectedId));
  const halfWindow = Math.floor(maxVisible / 2);
  const start = Math.max(0, Math.min(items.length - maxVisible, selectedIndex - halfWindow));
  return items.slice(start, start + maxVisible);
}
