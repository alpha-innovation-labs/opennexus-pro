/**
 * Formats a duration in milliseconds.
 *
 * @param milliseconds Duration in milliseconds.
 * @returns Human-readable duration.
 */
export function formatMilliseconds(milliseconds: number): string {
  if (milliseconds < 1_000) return `${Math.round(milliseconds)}ms`;
  return `${(milliseconds / 1_000).toFixed(1).replace(/\.0$/u, "")}s`;
}
