/**
 * Parses a usage-window duration from a chart label.
 *
 * @param label Usage window label.
 * @returns Duration in milliseconds when recognized.
 */
export function parseUsageWindowDurationMs(label: string): number | undefined {
  const normalized = label.toLowerCase();
  const hourMatch = normalized.match(/(?:^|\b)(\d+(?:\.\d+)?)\s*h(?:\b|$)/);
  if (hourMatch) return Number(hourMatch[1]) * 60 * 60 * 1000;
  if (/(^|\b)(week|1w|7d)(\b|$)/.test(normalized)) return 7 * 24 * 60 * 60 * 1000;
  if (/(^|\b)(day|1d|24h)(\b|$)/.test(normalized)) return 24 * 60 * 60 * 1000;
  return undefined;
}
