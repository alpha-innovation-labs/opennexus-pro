import type { ContextUsageDetailItem } from "./types";

/**
 * Sums token counts across detail items.
 *
 * @param items Tokenized detail items.
 * @returns Total token count.
 */
export function sumTokens(items: readonly ContextUsageDetailItem[]): number {
  return items.reduce((total, item) => total + item.tokens, 0);
}
