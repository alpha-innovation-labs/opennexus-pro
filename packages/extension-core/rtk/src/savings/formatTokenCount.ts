/**
 * Formats a token count using compact units.
 *
 * @param count Token count.
 * @returns Human-readable token count.
 */
export function formatTokenCount(count: number): string {
  const absolute = Math.abs(count);
  if (absolute < 1_000) return String(Math.round(count));
  if (absolute < 1_000_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/u, "")}k`;
  return `${(count / 1_000_000).toFixed(1).replace(/\.0$/u, "")}M`;
}
