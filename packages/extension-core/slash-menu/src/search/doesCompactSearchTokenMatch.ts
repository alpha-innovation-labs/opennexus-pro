import { compactSearchText } from "./compactSearchText";
import { isSearchSubsequence } from "./isSearchSubsequence";

/**
 * Checks whether a compact search token matches label text fuzzily.
 *
 * @param label Item label.
 * @param token Normalized query token.
 * @returns True when the compact token is present or is an anchored ordered label subsequence.
 */
export function doesCompactSearchTokenMatch(label: string, token: string): boolean {
  const compactLabel = compactSearchText(label);
  const compactToken = compactSearchText(token);
  if (compactToken.length < 3) return false;
  if (compactLabel.includes(compactToken)) return true;
  return compactLabel.startsWith(compactToken[0] ?? "") && isSearchSubsequence(compactLabel, compactToken);
}
