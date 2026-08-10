import { fetchGitHubApiJson } from "./fetchGitHubApiJson.js";
import type { GitHubTreeResponse } from "./githubTypes.js";

const MAX_TREE_ENTRIES = 200;

/**
 * Fetches a compact repository tree from GitHub.
 *
 * @param owner Repository owner.
 * @param repo Repository name.
 * @param ref Branch, tag, or commit ref.
 * @param prefix Optional path prefix for tree URLs.
 * @param signal Optional cancellation signal.
 * @returns Markdown-ready tree listing.
 */
export async function fetchGitHubTree(owner: string, repo: string, ref: string, prefix = "", signal?: AbortSignal): Promise<string> {
  const data = await fetchGitHubApiJson<GitHubTreeResponse>(`repos/${owner}/${repo}/git/trees/${ref}?recursive=1`, signal);
  const normalizedPrefix = prefix ? `${prefix.replace(/\/$/u, "")}/` : "";
  const paths = (data.tree ?? [])
    .flatMap((item) => item.path ? [item.path] : [])
    .filter((path) => path.startsWith(normalizedPrefix))
    .slice(0, MAX_TREE_ENTRIES);
  const suffix = data.truncated ? `\n... (GitHub API tree truncated)` : "";
  return paths.join("\n") + suffix;
}
