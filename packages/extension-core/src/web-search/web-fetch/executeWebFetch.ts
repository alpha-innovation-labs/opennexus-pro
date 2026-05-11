import { fetchWithTimeout } from "./fetchWithTimeout.js";
import { isHttpUrl } from "./isHttpUrl.js";
import { isImageMime } from "./isImageMime.js";
import { readResponseArrayBuffer } from "./readResponseArrayBuffer.js";
import { renderBody } from "./renderBody.js";
import type { WebFetchFormat, WebFetchResult } from "./webFetchTypes.js";

/**
 * Fetches one URL and converts it into text, markdown, html, or an image attachment.
 *
 * @param url URL to fetch.
 * @param format Desired output format.
 * @param timeout Optional timeout in seconds.
 * @param signal Optional cancellation signal.
 * @returns Fetched and rendered result.
 */
export async function executeWebFetch(
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
