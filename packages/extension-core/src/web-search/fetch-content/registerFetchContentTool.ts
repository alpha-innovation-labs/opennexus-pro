import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createFetchContentResponse } from "./createFetchContentResponse.js";
import { fetchContentUrl } from "./fetchContentUrl.js";
import { createResponseId } from "../storage/createResponseId.js";
import { storeContentResult } from "../storage/contentStore.js";
import type { StoredContentResult } from "../storage/storedContentTypes.js";

/**
 * Registers the native Nexus fetch_content tool.
 *
 * @param pi Pi extension API.
 */
export function registerFetchContentTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "fetch_content",
    label: "Fetch Content",
    description: "Fetch URL(s) and GitHub repository URLs as readable markdown, then store full content for get_search_content.",
    promptSnippet: "Use fetch_content for one or more URLs when full readable markdown should be stored for later retrieval.",
    parameters: Type.Object({
      url: Type.Optional(Type.String({ description: "Single URL to fetch" })),
      urls: Type.Optional(Type.Array(Type.String(), { description: "Multiple URLs to fetch" })),
      forceClone: Type.Optional(Type.Boolean({ description: "Accepted for compatibility; native GitHub handling uses the public GitHub API." })),
    }),
    async execute(_toolCallId, params, signal) {
      const urlList = params.urls ?? (params.url ? [params.url] : []);
      if (urlList.length === 0) return { content: [{ type: "text", text: "Error: No URL provided." }], details: { error: "No URL provided" } };
      const urls = await Promise.all(urlList.map((url) => fetchContentUrl(url, signal)));
      const stored: StoredContentResult = { id: createResponseId(), type: "fetch", timestamp: Date.now(), urls };
      storeContentResult(stored);
      pi.appendEntry?.("web-search-results", stored);
      return createFetchContentResponse(stored);
    },
  }));
}
