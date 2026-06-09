import { fetchWithTimeout } from "./fetchWithTimeout.js";
import { isHttpUrl } from "./isHttpUrl.js";
import { isImageMime } from "./isImageMime.js";
import { readResponseArrayBuffer } from "./readResponseArrayBuffer.js";
import { renderBody } from "./renderBody.js";
import { executeCrawl4AIFetch } from "./executeCrawl4AIFetch.js";
import { executeJinaFetch } from "./executeJinaFetch.js";
import type { WebFetchFormat, WebFetchResult } from "./webFetchTypes.js";

/**
 * Direct HTTP fetch fallback when Crawl4AI and Jina both fail.
 */
async function executeDirectFetch(
  url: string,
  format: WebFetchFormat = "markdown",
  timeout?: number,
  signal?: AbortSignal,
): Promise<WebFetchResult> {
  if (!isHttpUrl(url)) throw new Error("URL must start with http:// or https://");
  const response = await fetchWithTimeout(url, format, timeout, signal);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  const contentType = response.headers.get("content-type") ?? "";
  const mime = contentType.split(";")[0]?.trim().toLowerCase() || "application/octet-stream";
  const title = `${url} (${contentType})`;
  const arrayBuffer = await readResponseArrayBuffer(response);
  if (isImageMime(mime)) {
    const base64Content = Buffer.from(arrayBuffer).toString("base64");
    return { title, output: "Image fetched successfully", mime, contentType, attachment: { type: "file", mime, url: `data:${mime};base64,${base64Content}` } };
  }
  const content = new TextDecoder().decode(arrayBuffer);
  return { title, output: renderBody(content, contentType, format), mime, contentType };
}

/**
 * Fetches one URL using Crawl4AI as primary, Jina Reader as fallback,
 * and direct HTTP fetch as last resort.
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
  format: WebFetchFormat = "markdown",
  timeout?: number,
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

  // 3. Last resort: direct HTTP fetch
  return executeDirectFetch(url, format, timeout, signal);
}
