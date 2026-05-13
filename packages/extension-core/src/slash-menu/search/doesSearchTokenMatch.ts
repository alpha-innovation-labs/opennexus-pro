/**
 * Checks whether a normalized search token matches normalized candidate text exactly.
 *
 * @param text Normalized candidate text.
 * @param token Normalized query token.
 * @returns True when the token is present in candidate text.
 */
export function doesSearchTokenMatch(text: string, token: string): boolean {
  return text.includes(token);
}
