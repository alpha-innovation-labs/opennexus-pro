/**
 * Formats the current Pi context-usage snapshot for tool output.
 *
 * @param usage Current context-usage snapshot.
 * @returns Human-readable context-usage summary.
 */
export function formatContextUsage(usage: {
  tokens: number | null;
  contextWindow: number;
  percent: number | null;
} | null): string {
  if (!usage) {
    return "Current context usage is unavailable because there is no active model context yet.";
  }

  const tokens = usage.tokens === null ? "unknown" : usage.tokens.toLocaleString();
  const percent = usage.percent === null ? "unknown" : `${usage.percent.toFixed(1)}%`;

  return [
    `Context tokens used: ${tokens}`,
    `Context window: ${usage.contextWindow.toLocaleString()}`,
    `Context usage: ${percent}`,
  ].join("\n");
}
