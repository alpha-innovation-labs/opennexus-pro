import { convertHtmlToMarkdown } from "./convertHtmlToMarkdown.js";
import { extractTextFromHtml } from "./extractTextFromHtml.js";
import type { WebFetchFormat } from "./webFetchTypes.js";

/**
 * Renders fetched text into the requested output format.
 *
 * @param content Raw decoded response content.
 * @param contentType Response content type header.
 * @param format Desired output format.
 * @returns Rendered content.
 */
export function renderBody(content: string, contentType: string, format: WebFetchFormat): string {
  if (format === "html") return content;
  if (!contentType.includes("text/html")) return content;
  if (format === "text") return extractTextFromHtml(content);
  return convertHtmlToMarkdown(content);
}
