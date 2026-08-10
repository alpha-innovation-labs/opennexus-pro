import type { DeleteSessionMatch } from "./DeleteSessionMatch";

/**
 * Deduplicates filename-derived session matches by file path while preserving order.
 *
 * @param matches Session matches from local and global session directories.
 * @returns Unique session matches keyed by persisted JSONL path.
 */
export function getUniqueDeleteSessionMatchesByPath(matches: readonly DeleteSessionMatch[]): DeleteSessionMatch[] {
  const seenPaths = new Set<string>();
  const uniqueMatches: DeleteSessionMatch[] = [];

  for (const match of matches) {
    if (seenPaths.has(match.path)) continue;
    seenPaths.add(match.path);
    uniqueMatches.push(match);
  }

  return uniqueMatches;
}
