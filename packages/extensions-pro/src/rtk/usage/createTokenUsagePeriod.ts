import type { TokenUsagePeriod } from "./TokenUsagePeriod.js";

/**
 * Creates an empty period bucket.
 *
 * @param key Period key.
 * @returns Empty token usage period.
 */
export function createTokenUsagePeriod(key: string): TokenUsagePeriod {
  return { cacheRead: 0, cacheWrite: 0, input: 0, key, modelTokens: {}, output: 0, total: 0 };
}
