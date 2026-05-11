/**
 * Estimates tokenizer-sized usage for text when Pi only exposes aggregate live context usage.
 *
 * @param text Text to measure.
 * @returns Estimated token count.
 */
export function estimateTokensFromText(text: string): number {
  if (text.length === 0) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}
