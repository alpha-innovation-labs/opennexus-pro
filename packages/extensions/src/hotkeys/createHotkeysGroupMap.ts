import type { HotkeysEntry, HotkeysGroup } from "./types.js";

/**
 * Creates an insertion-ordered group map for hotkeys entries.
 *
 * @param titles Ordered group titles.
 * @returns Group map seeded with empty groups.
 */
export function createHotkeysGroupMap(titles: string[]): Map<string, HotkeysGroup> {
  return new Map(titles.map((title) => [title, { title, shortcuts: [] as HotkeysEntry[] }]));
}
