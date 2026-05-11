import { fetchGitHubApiJson } from "./fetchGitHubApiJson.js";
import type { GitHubApiRepo } from "./githubTypes.js";

/**
 * Resolves the default branch for a GitHub repository.
 *
 * @param owner Repository owner.
 * @param repo Repository name.
 * @param signal Optional cancellation signal.
 * @returns Default branch name.
 */
export async function getDefaultBranch(owner: string, repo: string, signal?: AbortSignal): Promise<string> {
  const data = await fetchGitHubApiJson<GitHubApiRepo>(`repos/${owner}/${repo}`, signal);
  return data.default_branch || "main";
}
