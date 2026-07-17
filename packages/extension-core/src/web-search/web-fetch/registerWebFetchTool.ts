import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createWebFetchToolResult } from "./createWebFetchToolResult.js";
import { executeWebFetch } from "./executeWebFetch.js";
import type { WebFetchFormat } from "./webFetchTypes.js";

/**
 * Registers the native Pi web_fetch tool with Crawl4AI + Jina fallback.
 *
 * @param pi Pi extension API.
 * @param crawl4aiUrl Optional Crawl4AI server URL from config.
 * @param jinaApiKey Optional Jina API key from config.
 */
export function registerWebFetchTool(
  pi: ExtensionAPI,
  crawl4aiUrl?: string,
  jinaApiKey?: string,
): void {
  pi.registerTool(defineTool({
    name: "web_fetch",
    label: "Web Fetch",
    description: "Fetch a URL and return text, markdown, html, or an image attachment. Uses Crawl4AI as primary backend, Jina Reader as fallback, and direct HTTP fetch as last resort.",
    promptSnippet: "Use web_fetch to retrieve a URL directly when search is not needed.",
    parameters: Type.Object({
      url: Type.String({ description: "The URL to fetch content from" }),
      format: Type.Optional(Type.Union([Type.Literal("text"), Type.Literal("markdown"), Type.Literal("html")], { description: "The format to return: text, markdown, or html. Defaults to markdown." })),
      timeout: Type.Optional(Type.Number({ description: "Optional timeout in seconds, max 120." })),
    }),
    async execute(_toolCallId, params, signal) {
      const result = await executeWebFetch(
        params.url,
        (params.format ?? "markdown") as WebFetchFormat,
        params.timeout,
        signal,
        crawl4aiUrl,
        jinaApiKey,
      );
      return createWebFetchToolResult(result);
    },
  }));
}
