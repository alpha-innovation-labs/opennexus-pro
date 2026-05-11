import type { AgentToolResult } from "@earendil-works/pi-coding-agent";
import type { StoredContentResult } from "../storage/storedContentTypes.js";

const MAX_INLINE_CONTENT = 30_000;

/**
 * Builds the Pi tool response for stored fetch_content results.
 *
 * @param stored Stored fetch result.
 * @returns Pi tool response object.
 */
export function createFetchContentResponse(stored: StoredContentResult): AgentToolResult<Record<string, unknown>> {
  const successful = stored.urls.filter((item) => !item.error).length;
  const totalChars = stored.urls.reduce((sum, item) => sum + item.content.length, 0);
  if (stored.urls.length === 1) {
    const item = stored.urls[0];
    if (item.error) return { content: [{ type: "text", text: `Error: ${item.error}` }], details: { responseId: stored.id, successful: 0, error: item.error } };
    const truncated = item.content.length > MAX_INLINE_CONTENT;
    const text = truncated
      ? `${item.content.slice(0, MAX_INLINE_CONTENT)}\n\n[Content truncated...]\n\nUse get_search_content({ responseId: "${stored.id}", urlIndex: 0 }) for full content.`
      : item.content;
    return { content: [{ type: "text", text }], details: { responseId: stored.id, urlCount: 1, successful: 1, title: item.title, totalChars: item.content.length, truncated } };
  }
  const rows = stored.urls.map((item) => item.error ? `- ${item.url}: Error - ${item.error}` : `- ${item.title || item.url} (${item.content.length} chars)`);
  const text = `## Fetched URLs\n\n${rows.join("\n")}\n\n---\nUse get_search_content({ responseId: "${stored.id}", urlIndex: 0 }) to retrieve full content.`;
  return { content: [{ type: "text", text }], details: { responseId: stored.id, urlCount: stored.urls.length, successful, totalChars } };
}
