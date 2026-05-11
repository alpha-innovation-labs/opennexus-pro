import { buildGitHubRepositorySearchUrl } from "./buildGitHubRepositorySearchUrl.js";
import type { GitHubRepositorySearchResponse } from "./codeSearchTypes.js";

/**
 * Searches public GitHub repositories without requiring provider API keys.
 *
 * @param query User search query.
 * @param language Optional language qualifier.
 * @param limit Maximum result count.
 * @param signal Optional cancellation signal.
 * @returns GitHub repository search response.
 */
export async function searchGitHubRepositories(
  query: string,
  language: string | undefined,
  limit: number,
  signal?: AbortSignal,
): Promise<GitHubRepositorySearchResponse> {
  const response = await fetch(buildGitHubRepositorySearchUrl(query, language, limit), { signal, headers: { Accept: "application/vnd.github+json", "User-Agent": "nexus" } });
  if (!response.ok) throw new Error(`GitHub search ${response.status}: ${response.statusText}`);
  return response.json() as Promise<GitHubRepositorySearchResponse>;
}
