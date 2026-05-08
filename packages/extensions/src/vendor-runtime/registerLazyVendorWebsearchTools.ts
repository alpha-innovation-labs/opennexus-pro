import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerLazyVendorWebsearchTool } from "./registerLazyVendorWebsearchTool.js";

const WEBSEARCH_TOOLS = [
	{
		name: "web_search",
		label: "Web Search",
		description: "Search the web using Perplexity AI, Exa, or Gemini and return synthesized answers with source citations.",
	},
	{
		name: "code_search",
		label: "Code Search",
		description: "Search for code examples, documentation, and API references.",
	},
	{
		name: "fetch_content",
		label: "Fetch Content",
		description: "Fetch URLs, GitHub repositories, YouTube transcripts, and local video content as readable markdown.",
	},
	{
		name: "get_search_content",
		label: "Get Search Content",
		description: "Retrieve full content captured by a previous web search or fetch content call.",
	},
] as const;

/**
 * Registers startup-light websearch tools that defer the heavy vendored module until first use.
 *
 * @param pi Pi extension API.
 */
export function registerLazyVendorWebsearchTools(pi: ExtensionAPI): void {
	for (const tool of WEBSEARCH_TOOLS) {
		registerLazyVendorWebsearchTool(pi, tool.name, tool.label, tool.description);
	}
}
