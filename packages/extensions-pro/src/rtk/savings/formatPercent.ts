/**
 * Formats a percentage with one decimal place when needed.
 *
 * @param value Percentage value.
 * @returns Human-readable percentage.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1).replace(/\.0$/u, "")}%`;
}
