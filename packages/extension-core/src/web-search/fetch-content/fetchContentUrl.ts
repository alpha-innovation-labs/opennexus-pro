import { fetchGitHubContent } from "../github/fetchGitHubContent.js";
import { parseGitHubUrl } from "../github/parseGitHubUrl.js";
import type { StoredFetchedUrl } from "../storage/storedContentTypes.js";
import { executeWebFetch } from "../web-fetch/executeWebFetch.js";

/**
 * Fetches content for one URL, using GitHub-specific handling when possible.
 *
 * @param url URL to fetch.
 * @param signal Optional cancellation signal.
 * @returns Stored fetched URL result.
 */
export async function fetchContentUrl(url: string, signal?: AbortSignal): Promise<StoredFetchedUrl> {
  try {
    const github = parseGitHubUrl(url);
    if (github) {
      const result = await fetchGitHubContent(github, signal);
      return { url, title: result.title, content: result.content, error: null };
    }
    const result = await executeWebFetch(url, "markdown", undefined, signal);
    return { url, title: result.title, content: result.output, error: null };
  } catch (err) {
    return { url, title: url, content: "", error: err instanceof Error ? err.message : String(err) };
  }
}
