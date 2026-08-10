/**
 * Creates a raw.githubusercontent.com URL for a repository file.
 *
 * @param owner Repository owner.
 * @param repo Repository name.
 * @param ref Branch, tag, or commit ref.
 * @param path File path inside the repository.
 * @returns Raw GitHub content URL.
 */
export function createRawGitHubUrl(owner: string, repo: string, ref: string, path: string): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`;
}
