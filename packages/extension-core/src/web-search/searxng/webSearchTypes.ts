/**
 * Supported SearXNG search categories.
 */
export type WebSearchCategory =
  | "general"
  | "news"
  | "videos"
  | "images"
  | "music"
  | "files"
  | "it"
  | "science"
  | "files"
  | "map";

/**
 * Supported time-range filters for SearXNG.
 */
export type WebSearchTimeRange = "day" | "week" | "month" | "year";

/**
 * Parameters accepted by the web_search tool.
 */
export type WebSearchParams = {
  query: string;
  max_results?: number;
  region?: string;
  language?: string;
  time_range?: WebSearchTimeRange;
  categories?: WebSearchCategory[];
  safe_search?: boolean;
};

/**
 * A single search result returned by the web_search tool.
 */
export type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

/**
 * Full response shape from the web_search tool.
 */
export type WebSearchResponse = {
  results: WebSearchResult[];
  query: string;
  engine?: string;
  error?: string;
};
