import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import type { WebFetchResult } from "./webFetchTypes.js";

/**
 * Converts a web fetch result into a Pi tool response.
 *
 * @param result Fetched web content.
 * @returns Pi tool response object.
 */
export function createWebFetchToolResult(result: WebFetchResult): AgentToolResult<Record<string, unknown>> {
  const content: AgentToolResult<Record<string, unknown>>["content"] = [];
  if (result.attachment) {
    content.push({ type: "image", data: result.attachment.url.replace(/^data:[^,]+,/u, ""), mimeType: result.mime });
  }
  content.push({ type: "text", text: result.output });
  return { content, details: { title: result.title, mime: result.mime, contentType: result.contentType } };
}
