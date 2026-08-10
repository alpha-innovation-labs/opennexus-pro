import { fetchRawGitHubFile } from "./fetchRawGitHubFile.js";

const README_CANDIDATES = ["README.md", "readme.md", "README", "README.txt", "README.rst"];

/**
 * Fetches the first recognizable README from a GitHub repository.
 *
 * @param owner Repository owner.
 * @param repo Repository name.
 * @param ref Branch, tag, or commit ref.
 * @param signal Optional cancellation signal.
 * @returns README text, or null when unavailable.
 */
export async function fetchGitHubReadme(owner: string, repo: string, ref: string, signal?: AbortSignal): Promise<string | null> {
  for (const path of README_CANDIDATES) {
    const content = await fetchRawGitHubFile(owner, repo, ref, path, signal);
    if (content) return content.length > 8192 ? `${content.slice(0, 8192)}\n\n[README truncated at 8K chars]` : content;
  }
  return null;
}
