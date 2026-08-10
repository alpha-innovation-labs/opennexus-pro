import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { executeWebSearch } from "./executeWebSearch";
import { formatWebSearchResult } from "./formatWebSearchResult";
import type { WebSearchParams, WebSearchCategory, WebSearchTimeRange } from "./webSearchTypes";

const VALID_CATEGORIES: WebSearchCategory[] = [
  "general", "news", "videos", "images", "music", "files", "it", "science", "map",
];

const VALID_TIME_RANGES: WebSearchTimeRange[] = ["day", "week", "month", "year"];

/**
 * Registers the web_search tool backed by SearXNG.
 *
 * @param pi Pi extension API.
 * @param searxngUrl SearXNG base URL from config. Must be non-empty.
 */
export function registerWebSearchTool(
  pi: ExtensionAPI,
  searxngUrl: string,
): void {
  // Capture the URL at registration time so the closure always has it.
  const resolvedUrl = searxngUrl;

  pi.registerTool(defineTool({
    name: "web_search",
    label: "Web Search",
    description: "Search the web using a SearXNG instance and return up to 10 results as title/url/snippet tuples. Supports optional filters: max_results, region, language, time_range, categories, safe_search.",
    promptSnippet: "Use web_search to search the web for information. Specify query and optional filters like max_results, region, language, time_range, categories, or safe_search.",
    parameters: Type.Object({
      query: Type.String({ description: "The search query string." }),
      max_results: Type.Optional(Type.Number({ description: "Maximum number of results to return (1-10, default 10)." })),
      region: Type.Optional(Type.String({ description: "Region code for search localization (e.g., 'us-en', 'de-de')." })),
      language: Type.Optional(Type.String({ description: "Language code for results (e.g., 'en', 'de', 'zh')." })),
      time_range: Type.Optional(Type.Union(VALID_TIME_RANGES.map(t => Type.Literal(t)), { description: "Time range filter: day, week, month, or year." })),
      categories: Type.Optional(Type.Array(Type.Union(VALID_CATEGORIES.map(c => Type.Literal(c)), { description: "Search categories: general, news, videos, images, music, files, it, science, map." }))),
      safe_search: Type.Optional(Type.Boolean({ description: "Enable safe search filtering (default false)." })),
    }),
    async execute(_toolCallId, params) {
      const typedParams: WebSearchParams = {
        query: params.query,
        max_results: params.max_results,
        region: params.region,
        language: params.language,
        time_range: (params.time_range as WebSearchTimeRange | undefined),
        categories: (params.categories as WebSearchCategory[] | undefined),
        safe_search: params.safe_search,
      };
      const response = await executeWebSearch(typedParams, resolvedUrl);
      return {
        content: [{ type: "text", text: formatWebSearchResult(response) }],
        details: response,
      };
    },
  }));
}
