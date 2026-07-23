const SPARK_CHARS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

/**
 * Creates a compact sparkline for usage history values.
 *
 * @param values Numeric values.
 * @param width Maximum sparkline width.
 * @returns Sparkline string.
 */
export function createSparkline(values: number[], width: number): string {
  const sampled = values.slice(Math.max(0, values.length - width));
  if (sampled.length === 0) return "";
  const min = Math.min(...sampled);
  const max = Math.max(...sampled);
  const span = Math.max(1, max - min);
  return sampled.map((value) => SPARK_CHARS[Math.min(SPARK_CHARS.length - 1, Math.floor(((value - min) / span) * (SPARK_CHARS.length - 1)))]).join("");
}
