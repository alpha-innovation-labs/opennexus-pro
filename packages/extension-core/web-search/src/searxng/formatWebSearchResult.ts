import type { WebSearchResponse } from "./webSearchTypes";

/**
 * Formats a WebSearchResponse for display in the TUI.
 *
 * @param response The search response.
 * @returns Formatted markdown string with numbered results.
 */
export function formatWebSearchResult(response: WebSearchResponse): string {
  if (response.error) {
    return `Search error: ${response.error}`;
  }

  if (response.results.length === 0) {
    return `No results found for: ${response.query}`;
  }

  const lines = [`Search results for: ${response.query}`];
  response.results.forEach((r, i) => {
    lines.push(`${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`);
  });
  return lines.join("\n\n");
}
