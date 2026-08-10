/**
 * Checks whether every query character appears in order within candidate text.
 *
 * @param candidate Compact candidate text.
 * @param query Compact query text.
 * @returns True when query is an ordered subsequence of candidate.
 */
export function isSearchSubsequence(candidate: string, query: string): boolean {
  if (!query) return true;
  let queryIndex = 0;
  for (const char of candidate) {
    if (char === query[queryIndex]) queryIndex += 1;
    if (queryIndex === query.length) return true;
  }
  return false;
}
