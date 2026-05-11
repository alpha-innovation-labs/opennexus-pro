import { createRawGitHubUrl } from "./createRawGitHubUrl.js";

/**
 * Fetches a raw text file from GitHub.
 *
 * @param owner Repository owner.
 * @param repo Repository name.
 * @param ref Branch, tag, or commit ref.
 * @param path File path inside the repository.
 * @param signal Optional cancellation signal.
 * @returns File text, or null when not found.
 */
export async function fetchRawGitHubFile(
  owner: string,
  repo: string,
  ref: string,
  path: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const response = await fetch(createRawGitHubUrl(owner, repo, ref, path), { signal, headers: { "User-Agent": "nexus" } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub raw ${response.status}: ${response.statusText}`);
  return response.text();
}
