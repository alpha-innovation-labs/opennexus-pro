/**
 * Builds a public GitHub repository search URL for code-related discovery.
 *
 * @param query User search query.
 * @param language Optional language qualifier.
 * @param limit Maximum number of results.
 * @returns GitHub REST API search URL.
 */
export function buildGitHubRepositorySearchUrl(query: string, language: string | undefined, limit: number): string {
  const qualifiers = language ? `${query} language:${language}` : query;
  const params = new URLSearchParams({ q: qualifiers, sort: "stars", order: "desc", per_page: String(Math.min(Math.max(limit, 1), 10)) });
  return `https://api.github.com/search/repositories?${params.toString()}`;
}
