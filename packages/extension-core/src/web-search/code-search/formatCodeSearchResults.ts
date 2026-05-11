import type { GitHubRepositorySearchResponse } from "./codeSearchTypes.js";

/**
 * Formats GitHub repository search results as markdown.
 *
 * @param query User search query.
 * @param data GitHub search response.
 * @returns Markdown summary of repositories.
 */
export function formatCodeSearchResults(query: string, data: GitHubRepositorySearchResponse): string {
  const items = data.items ?? [];
  if (items.length === 0) return `No code repositories found for "${query}".`;
  const rows = items.map((item, index) => {
    const language = item.language ? ` · ${item.language}` : "";
    const stars = typeof item.stargazers_count === "number" ? ` · ★ ${item.stargazers_count}` : "";
    const description = item.description ? `\n   ${item.description}` : "";
    return `${index + 1}. [${item.full_name ?? "unknown"}](${item.html_url ?? ""})${language}${stars}${description}`;
  });
  return `## Code search: ${query}\n\n${rows.join("\n")}`;
}
