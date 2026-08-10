import { fetchGitHubReadme } from "./fetchGitHubReadme.js";
import { fetchGitHubTree } from "./fetchGitHubTree.js";
import { fetchRawGitHubFile } from "./fetchRawGitHubFile.js";
import { getDefaultBranch } from "./getDefaultBranch.js";
import type { GitHubUrlInfo } from "./githubTypes.js";

/**
 * Fetches markdown content for a parsed GitHub code URL.
 *
 * @param info Parsed GitHub code URL info.
 * @param signal Optional cancellation signal.
 * @returns Markdown title and content.
 */
export async function fetchGitHubContent(info: GitHubUrlInfo, signal?: AbortSignal): Promise<{ title: string; content: string }> {
  const ref = info.ref || await getDefaultBranch(info.owner, info.repo, signal);
  const title = info.path ? `${info.owner}/${info.repo} - ${info.path}` : `${info.owner}/${info.repo}`;
  if (info.type === "blob" && info.path) {
    const file = await fetchRawGitHubFile(info.owner, info.repo, ref, info.path, signal);
    if (!file) throw new Error(`GitHub file not found: ${info.path}`);
    const body = file.length > 100_000 ? `${file.slice(0, 100_000)}\n\n[File truncated at 100K chars]` : file;
    return { title, content: `## ${info.path}\n\n${body}` };
  }
  const [tree, readme] = await Promise.all([
    fetchGitHubTree(info.owner, info.repo, ref, info.path ?? "", signal),
    info.type === "root" ? fetchGitHubReadme(info.owner, info.repo, ref, signal) : Promise.resolve(null),
  ]);
  const readmeBlock = readme ? `\n\n## README.md\n\n${readme}` : "";
  return { title, content: `## Structure\n\n${tree}${readmeBlock}\n\nThis is a GitHub API view. Use web_fetch on a blob URL for full file content.` };
}
