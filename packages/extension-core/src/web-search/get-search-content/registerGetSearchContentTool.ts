import { Type } from "@earendil-works/pi-ai";
import { defineTool, type AgentToolResult, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getContentResult } from "../storage/contentStore.js";

/**
 * Registers the native Nexus get_search_content tool.
 *
 * @param pi Pi extension API.
 */
export function registerGetSearchContentTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "get_search_content",
    label: "Get Search Content",
    description: "Retrieve full content captured by fetch_content.",
    promptSnippet: "Use after fetch_content when full stored content is needed via responseId.",
    parameters: Type.Object({
      responseId: Type.String({ description: "The responseId from fetch_content" }),
      urlIndex: Type.Optional(Type.Number({ description: "Optional zero-based URL index" })),
    }),
    async execute(_toolCallId, params): Promise<AgentToolResult<Record<string, unknown>>> {
      const stored = getContentResult(params.responseId);
      if (!stored) return { content: [{ type: "text", text: `Error: No stored content found for responseId ${params.responseId}` }], details: { error: "Not found" } };
      if (typeof params.urlIndex === "number") {
        const item = stored.urls[params.urlIndex];
        if (!item) return { content: [{ type: "text", text: `Error: urlIndex ${params.urlIndex} out of range.` }], details: { error: "Index out of range" } };
        return { content: [{ type: "text", text: item.error ? `Error: ${item.error}` : item.content }], details: { responseId: stored.id, urlIndex: params.urlIndex, title: item.title, url: item.url } };
      }
      const text = stored.urls.map((item, index) => `## [${index}] ${item.title}\n${item.error ? `Error: ${item.error}` : item.content}`).join("\n\n---\n\n");
      return { content: [{ type: "text", text }], details: { responseId: stored.id, urlCount: stored.urls.length } };
    },
  }));
}
