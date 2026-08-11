import { executeCrawl4AIFetch } from "./executeCrawl4AIFetch";
import { executeJinaFetch } from "./executeJinaFetch";
import type { WebFetchFormat, WebFetchResult } from "./webFetchTypes";

/**
 * Fetches one URL using Crawl4AI as primary, Jina Reader as fallback.
 *
 * @param url URL to fetch.
 * @param format Desired output format.
 * @param timeout Optional timeout in seconds.
 * @param signal Optional cancellation signal.
 * @param crawl4aiUrl Optional Crawl4AI server URL. If provided, Crawl4AI is tried first.
 * @param jinaApiKey Optional Jina API key for Jina Reader fallback.
 * @returns Fetched and rendered result.
 */
export async function executeWebFetch(
  url: string,
  _format: WebFetchFormat = "markdown",
  _timeout?: number,
  signal?: AbortSignal,
  crawl4aiUrl?: string,
  jinaApiKey?: string,
): Promise<WebFetchResult> {
  // 1. Try Crawl4AI if URL is configured
  if (crawl4aiUrl) {
    const crawlResult = await executeCrawl4AIFetch(url, crawl4aiUrl, signal);
    if (crawlResult) return crawlResult;
  }

  // 2. Fallback to Jina Reader
  const jinaResult = await executeJinaFetch(url, jinaApiKey, signal);
  if (jinaResult) return jinaResult;

  // 3. Both backends unavailable — throw so the user knows to configure one.
  throw new Error(
    "No fetch backend configured. Set CRAWL4AI_URL and/or JINA_API_KEY, " +
      "or configure crawl4ai and jina sections in your Nexus config file.",
  );
}
