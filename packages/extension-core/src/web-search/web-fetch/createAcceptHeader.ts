import type { WebFetchFormat } from "./webFetchTypes.js";

/**
 * Creates the HTTP Accept header for the requested output format.
 *
 * @param format Desired output format.
 * @returns Accept header value with fallbacks.
 */
export function createAcceptHeader(format: WebFetchFormat): string {
  if (format === "markdown") {
    return "text/markdown;q=1.0, text/x-markdown;q=0.9, text/plain;q=0.8, text/html;q=0.7, */*;q=0.1";
  }
  if (format === "text") {
    return "text/plain;q=1.0, text/markdown;q=0.9, text/html;q=0.8, */*;q=0.1";
  }
  return "text/html;q=1.0, application/xhtml+xml;q=0.9, text/plain;q=0.8, text/markdown;q=0.7, */*;q=0.1";
}
