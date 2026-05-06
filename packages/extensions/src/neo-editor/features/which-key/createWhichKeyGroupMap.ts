import type { WhichKeyEntry, WhichKeyGroup } from "./types.js";

/**
 * Creates an insertion-ordered group map for which-key entries.
 *
 * @param titles Ordered group titles.
 * @returns Group map seeded with empty groups.
 */
export function createWhichKeyGroupMap(titles: string[]): Map<string, WhichKeyGroup> {
  return new Map(titles.map((title) => [title, { title, shortcuts: [] as WhichKeyEntry[] }]));
}
