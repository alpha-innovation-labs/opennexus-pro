/**
 * Fetches JSON from the public GitHub REST API.
 *
 * @param path API path without the leading slash.
 * @param signal Optional cancellation signal.
 * @returns Parsed JSON response.
 */
export async function fetchGitHubApiJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`https://api.github.com/${path}`, {
    signal,
    headers: { Accept: "application/vnd.github+json", "User-Agent": "nexus" },
  });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  return response.json() as Promise<T>;
}
