import { compactSearchText } from "./compactSearchText.js";
import { isSearchSubsequence } from "./isSearchSubsequence.js";

/**
 * Checks whether a normalized search token matches normalized candidate text.
 *
 * @param text Normalized candidate text.
 * @param token Normalized query token.
 * @returns True when the token is present or is a compact ordered subsequence.
 */
export function doesSearchTokenMatch(text: string, token: string): boolean {
  if (text.includes(token)) return true;
  const compactText = compactSearchText(text);
  const compactToken = compactSearchText(token);
  return compactToken.length >= 3 && isSearchSubsequence(compactText, compactToken);
}
