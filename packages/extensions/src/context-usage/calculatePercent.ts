/**
 * Calculates context-window percentage for a token count.
 *
 * @param tokens Token count.
 * @param contextWindow Context window size.
 * @returns Percentage of the context window.
 */
export function calculatePercent(tokens: number, contextWindow: number): number {
  if (contextWindow <= 0) return 0;
  return (tokens / contextWindow) * 100;
}
