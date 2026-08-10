import { formatTokenCount } from "./formatTokenCount.js";

/**
 * Formats a nullable token count.
 *
 * @param tokens Token count or null when unknown.
 * @returns Human-readable token count.
 */
export function formatMaybeTokenCount(tokens: number | null): string {
  return tokens === null ? "unknown" : formatTokenCount(tokens);
}
