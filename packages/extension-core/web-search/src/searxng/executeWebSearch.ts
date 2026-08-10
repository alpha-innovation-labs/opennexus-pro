import type { WebSearchParams, WebSearchResponse, WebSearchResult, WebSearchTimeRange, WebSearchCategory } from "./webSearchTypes";

const USER_AGENT = "Nexus-WebTools/1.0";

/**
 * Strips control characters that break JSON parsing.
 * SearXNG responses can contain bytes 0x00–0x08, 0x0B, 0x0C, 0x0E–0x1F.
 *
 * @param text Raw response string.
 * @returns Cleaned string safe for JSON.parse.
 */
function stripControlChars(text: string): string {
  return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

/**
 * Builds the SearXNG search URL from parameters.
 *
 * @param baseUrl SearXNG instance base URL.
 * @param params Tool parameters.
 * @returns URL string ready for GET.
 */
function buildSearXNGUrl(
  baseUrl: string,
  params: WebSearchParams,
): string {
  const url = new URL("/search", baseUrl);
  url.searchParams.set("q", params.query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(params.max_results ?? 10));

  if (params.region) url.searchParams.set("region", params.region);
  if (params.language) url.searchParams.set("language", params.language);
  if (params.time_range) url.searchParams.set("time_range", params.time_range as string);
  if (params.categories && params.categories.length > 0) {
    url.searchParams.set("categories", params.categories.join(","));
  }
  if (params.safe_search !== undefined) {
    url.searchParams.set("safesearch", params.safe_search ? "2" : "0");
  }
  return url.toString();
}

/**
 * Parses SearXNG JSON response into typed results.
 * SearXNG returns { results: [{title, url, content, ...}] }.
 *
 * @param data Parsed JSON object.
 * @returns Formatted results array.
 */
function parseSearXNGResults(data: unknown): WebSearchResult[] {
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  const results = obj.results;
  if (!Array.isArray(results)) return [];

  return results
    .filter((r: unknown): r is Record<string, unknown> =>
      r != null && typeof r === "object" && typeof (r as Record<string, unknown>).title === "string"
    )
    .map((r: Record<string, unknown>) => ({
      title: String(r.title ?? ""),
      url: String(r.url ?? ""),
      snippet: String(r.content ?? r.snippet ?? ""),
    }));
}

/**
 * Executes a web search against a SearXNG instance.
 *
 * @param params Search parameters.
 * @param searxngUrl SearXNG base URL (required — must come from config).
 * @param signal Optional AbortSignal.
 * @returns Search response with results or error.
 */
export async function executeWebSearch(
  params: WebSearchParams,
  searxngUrl: string,
  signal?: AbortSignal,
): Promise<WebSearchResponse> {
  if (!searxngUrl) {
    return {
      results: [],
      query: params.query,
      error:
        "SearXNG URL not configured. Configure it in your Nexus user config file under `searxng.url`, " +
        "or set the SEARXNG_URL environment variable.",
    };
  }
  const baseUrl = searxngUrl.replace(/\/+$/, "");
  const apiUrl = buildSearXNGUrl(baseUrl, params);

  try {
    const fetchSignal = signal ?? AbortSignal.timeout(5000);
    const response = await fetch(apiUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: fetchSignal,
    });

    if (!response.ok) {
      // SearXNG returns 403 when JSON format is not enabled in settings.yml
      if (response.status === 403) {
        return {
          results: [],
          query: params.query,
          error: "SearXNG JSON API is not enabled. Ensure 'json' is listed under 'formats:' in settings.yml and restart the container.",
        };
      }
      return {
        results: [],
        query: params.query,
        error: `SearXNG returned HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const rawText = await response.text();
    const cleaned = stripControlChars(rawText);
    let data: unknown;
    try {
      data = JSON.parse(cleaned);
    } catch {
      return {
        results: [],
        query: params.query,
        error: "SearXNG returned malformed JSON after stripping control characters.",
      };
    }

    // Detect SearXNG error responses like {"detail":"Not Found"}
    // which indicate the instance is down or misconfigured.
    if (data && typeof data === "object" && "detail" in data) {
      return {
        results: [],
        query: params.query,
        error: `SearXNG instance error: ${String((data as Record<string, unknown>).detail ?? "Unknown")}`,
      };
    }

    const results = parseSearXNGResults(data);

    // Warn about unresponsive engines but still return valid results.
    if (data && typeof data === "object" && results.length > 0) {
      const obj = data as Record<string, unknown>;
      const unresponsive = obj.unresponsive_engines;
      if (Array.isArray(unresponsive) && unresponsive.length > 0) {
        const engineErrors = unresponsive
          .map((e: unknown) => {
            if (Array.isArray(e) && e.length >= 2) {
              return `${String(e[0])}: ${String(e[1])}`;
            }
            return String(e);
          })
          .join(", ");
        console.warn(
          `[web_search] Some engines unresponsive: ${engineErrors}. Returning ${results.length} results from healthy engines.`,
        );
      }
    }

    return { results, query: params.query };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      results: [],
      query: params.query,
      error: `SearXNG unreachable at ${baseUrl}: ${message}`,
    };
  }
}
