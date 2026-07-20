# Web Tools Extension — Design Document

**Status:** Draft  
**Extension:** `web-tools` (replaces existing `websearch` feature flag)  
**Packages:** `packages/extension-core/src/web-tools/`

---

## 1. Problem Statement

The current `websearch` feature provides four tools (`web_fetch`, `code_search`, `fetch_content`, `get_search_content`) but they all rely on Node.js `fetch()` + `linkedom` + `turndown` for HTML-to-markdown conversion. This pipeline **cannot execute JavaScript**, so JS-heavy sites (Reddit, SPAs, dynamic pages) return empty or incomplete content. There is also no search tool — discovery requires a separate Pi extension (`rpiv-web-tools`) or manual curl.

## 2. Solution Overview

A new unified `web-tools` extension that replaces the existing `websearch` feature and exposes two tools backed by three backend tiers:

| Tool | Primary Backend | Fallback Backend |
|---|---|---|
| `web_search` | SearXNG (self-hosted) | — |
| `web_fetch` | Crawl4AI (self-hosted) | Jina Reader (cloud) |

This design gives the LLM full web discovery and full-page extraction — including JS-rendered content — while keeping self-hosting as the default.

> **[NOTE]** `web_search_and_fetch` was initially designed as a one-shot search+extract tool but has been removed. `web_search` and `web_fetch` remain as separate, composable tools.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Nexus Extension (web-tools)                            │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ web_search   │   │ web_fetch    │   │ web_search_ │ │
│  │              │   │              │   │ and_fetch   │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬──────┘ │
│         │                  │                   │        │
│    ┌────▼────┐        ┌────▼────┐         ┌────▼─────┐  │
│    │ SearXNG │        │Crawl4AI │         │Crawl4AI  │  │
│    │ :8090   │        │ :11235  │         │ /search  │  │
│    └────┬────┘        └────┬────┘         └────┬─────┘  │
│         │                  │                    │        │
│         │              ┌───▼────┐           ┌───▼────┐   │
│         │              │ FAIL?  │           │        │   │
│         │              └───┬────┘           │        │   │
│         │                  │                │        │   │
│         │              ┌───▼────────────────┘        │   │
│         │              │ Jina Reader (fallback)      │   │
│         │              │ api.jina.ai/reader          │   │
│         └──────────────┼─────────────────────────────┘   │
│                        │                                 │
│  ┌─────────────────────▼────────────────────────────────┐│
│  │  Config + Health Monitor                              ││
│  │  - Validates SearXNG + Crawl4AI availability          ││
│  │  - Warns on startup if instances are unreachable      ││
│  │  - Provides /web-tools-setup command                  ││
│  └───────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration

### 4.1 Config File

Location: `~/.config/nexus/settings.json` (Nexus-branded, not `~/.pi/`)

> **[NOTE]** Both SearXNG (`:8090`) and Crawl4AI (`:11235`) default to `http://100.106.251.92` — this is the **Tailscale IP** of the server, not the public server IP (`178.104.151.23`). Access requires being on the same Tailscale network.

```json
{
  "searxng": {
    "enabled": true,
    "url": "http://100.106.251.92:8090",
    "apiKey": ""
  },
  "crawl4ai": {
    "enabled": true,
    "url": "http://100.106.251.92:11235",
    "token": ""
  },
  "jina": {
    "enabled": true,
    "apiKey": ""
  }
```

> **[NOTE]** The `jina` section is **optional**. Jina Reader works without an API key (free tier). The section only needs to exist if you want to set a paid API key for higher rate limits.

```json
}
```

### 4.2 Environment Variable Overrides

| Variable | Purpose | Default |
|---|---|---|
| `SEARXNG_URL` | SearXNG base URL | `http://100.106.251.92:8090` |
| `SEARXNG_API_KEY` | SearXNG Bearer token | _(none)_ |
| `CRAWL4AI_URL` | Crawl4AI server URL | `http://100.106.251.92:11235` |
| `CRAWL4AI_TOKEN` | Crawl4AI JWT auth | _(none)_ |
| `JINA_API_KEY` | Jina Reader API key (optional — free tier works without it) | _(none)_ |

**Precedence:** env var > config file > default URL.

### 4.3 Docker Deployment Notes (Verified)

> **[UPDATE 2026-06-08]** The following Docker configurations have been tested and verified working. Update your deployment to match.

**SearXNG** — port mismatch and JSON format fix required:

```bash
# Container internal port: 8080 (Granian web server)
# Docker bind: 8090:8080 (external port is 8090, NOT 8888)
# Bound to Tailscale IP 100.106.251.92:8090 only (not public)

docker run -d \
  -p 8090:8080 \
  --name searxng \
  -e SEARXNG_BASE_URL=http://100.106.251.92:8090 \
  searxng/searxng:latest
```

**Critical fix — JSON format must be enabled in settings.yml:**

Default SearXNG config has `formats: - html` (JSON disabled). Without this fix, `/search` returns 403 Forbidden. The `limiter: false` setting is already default and does not need changing.

```bash
# Add 'json' to the formats list in settings.yml
sed -i '/^formats:$/a\    - json' /path/to/settings.yml
# Restart the container
docker restart searxng
```

Verify: `curl "http://100.106.251.92:8090/search?q=test&format=json&limit=1"` returns JSON.

Note: SearXNG responses may contain control characters. Strip them before parsing JSON:
```bash
# Strip control chars (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F)
sed 's/[\x00-\x08\x0b\x0c\x0e-\x1f]//g'
```

**Crawl4AI** — no setup issues (works out of the box):

```bash
docker run -d \
  -p 11235:11235 \
  --name crawl4ai \
  --shm-size=1g \
  unclecode/crawl4ai:latest
```

Verify: `curl http://100.106.251.92:11235/health` returns `{"status": "ok"}` (200).

**Important: Crawl4AI `/crawl` endpoint requires `urls` as a list** (not a string):
```bash
curl -X POST "http://100.106.251.92:11235/crawl" \
  -H "Content-Type: application/json" \
  -d '{"urls":["https://example.com"],"cache_mode":"bypass"}'
```

Crawl4AI response structure: `results[0].markdown` is an object with sub-keys:
- `raw_markdown` — actual markdown content (use this)
- `markdown_with_citations` — includes ⟨n⟩ citation markers
- `references_markdown` — list of citation URLs and titles
- `fit_markdown` / `fit_html` — currently empty

### 4.4 Health Check on Startup

On extension registration, the extension calls:

- **SearXNG:** `GET /` (not `/health` — SearXNG has no `/health` endpoint, returns HTML at `/`)
- **Crawl4AI:** `GET /health` (returns `{"status": "ok"}`)

If either is unreachable:
- Log a warning: `"SearXNG at <url> is unreachable. web_search will fail until the instance is started."`
- Log a warning: `"Crawl4AI at <url> is unreachable. web_fetch will fall back to Jina Reader."`
- The `/web-tools-setup` command is surfaced in the slash-menu to guide the user through setup.

### 4.5 Setup Command

The `/web-tools-setup` command opens a modal that:

1. Shows the current status of each backend (reachable / unreachable)
2. Provides the Docker commands to start missing instances
3. Allows the user to change URLs inline
4. Persists changes to `~/.config/nexus/settings.json`

**Docker commands shown (verified working):**

```bash
# SearXNG — note: external port is 8090, not 8888
docker run -d -p 8090:8080 --name searxng \
  -e SEARXNG_BASE_URL=http://100.106.251.92:8090 \
  searxng/searxng:latest
# Then: sed -i '/formats:$/a\    - json' /path/to/settings.yml && docker restart searxng

# Crawl4AI
docker run -d -p 11235:11235 --name crawl4ai --shm-size=1g \
  unclecode/crawl4ai:latest

# Jina — no setup needed (cloud API, works without API key)
```

---

## 5. Tool Definitions

### 5.1 `web_search`

**Description:** Search the web via a self-hosted SearXNG instance. Returns up to 10 titled snippets with SearXNG parameter support.

> **[UPDATE 2026-06-08]** SearXNG must have `json` in `formats` list (see §4.3). Without it, `/search` returns 403. Strip control characters from response before JSON parsing.

**Runtime note:** The shell scripts (`search.sh`, `crawl.sh`) use the user's Tailscale IP (`100.106.251.92`) as the runtime URL. The design doc defaults to `http://100.106.251.92:8090` / `http://100.106.251.92:11235` — users override via env vars or config file.

**Parameters:**
```typescript
Type.Object({
  query: Type.String({ description: "Natural-language search query" }),
  max_results: Type.Optional(Type.Number({ description: "Max results (1-10, default 5)" })),
  region: Type.Optional(Type.String({ description: "SearXNG region code (e.g. 'all', 'en', 'us', 'de')" })),
  language: Type.Optional(Type.String({ description: "SearXNG language code (e.g. 'all', 'en', 'de', 'fr')" })),
  time_range: Type.Optional(Type.Union([
    Type.Literal("day"),
    Type.Literal("week"),
    Type.Literal("month"),
    Type.Literal("year")
  ])),
  categories: Type.Optional(Type.String({ description: "SearXNG categories (e.g. 'general', 'news', 'images', 'videos', 'files')" })),
  engines: Type.Optional(Type.String({ description: "SearXNG engines to query (comma-separated, e.g. 'google,bing,duckduckgo')" })),
  safe_search: Type.Optional(Type.Union([
    Type.Literal(0), // None
    Type.Literal(1), // Moderate
    Type.Literal(2)  // Strict
  ]))
})
```

**Returns:**
```typescript
{
  content: [{ type: "text", text: "1. **Title**\n   url\n   snippet\n..." }],
  details: {
    query: string,
    backend: "searxng",
    resultCount: number,
    results: Array<{ title: string, url: string, snippet: string }>
  }
}
```

**Implementation:** `GET /search?q=QUERY&format=json&limit=N&categories=C` on SearXNG URL. Returns `results[]` as title/url/snippet tuples. Sends `User-Agent: Nexus-WebTools/1.0` header. No API key is used in the default shell script configuration. **Strip control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F) from response before JSON parsing** — SearXNG responses contain control chars that break Python/Node JSON parsers.

---

### 5.2 `web_fetch`

> **[CONFIRMED]** Crawl4AI `/crawl` is **synchronous** — POST `/crawl` blocks until page is rendered (~10-30s for JS-heavy pages), then returns markdown directly. No jobId polling needed.

> **[RESOLVED]** `web_fetch` timeout is managed internally with a fixed timeout — no LLM-controllable `timeout` parameter.

**Description:** Fetch a URL and extract clean markdown content. Uses a headless browser (Crawl4AI) as primary backend, with Jina Reader as fallback, and direct HTTP fetch (`linkedom` + `turndown`) as last resort.

> **[IMPLEMENTED]** The `web_fetch` pipeline is: **Crawl4AI → Jina Reader → direct HTTP fetch**. All three layers live in `packages/extension-core/src/web-search/web-fetch/`. The old direct-fetch code (`executeWebFetch.ts`) was refactored into `executeDirectFetch` and is only reached when both Crawl4AI and Jina fail.

> **[NEW]** Crawl4AI supports **batch URL crawling** — multiple URLs can be passed in a single POST request. The extension may batch URLs when the LLM requests multiple fetches in one turn.

**Parameters:**
```typescript
Type.Object({
  url: Type.String({ description: "The URL to fetch content from" }),
  raw: Type.Optional(Type.Boolean({ description: "Return raw HTML instead of markdown" })),
  format: Type.Optional(Type.Union([
    Type.Literal("text"),
    Type.Literal("markdown"),
    Type.Literal("html")
  ]))
})
```

**Returns:**
```typescript
{
  content: [{ type: "text", text: markdown_string }],
  details: {
    url: string,
    title: string,
    contentType: string,
    contentLength: number,
    backend: "crawl4ai" | "jina",
    success: boolean,
    truncation?: { length: number, fullOutputPath?: string }
  }
}
```

**Implementation:**
1. Load config via `loadWebToolsConfig()` → reads `~/.config/nexus/settings.json` + env vars.
2. If `crawl4ai.url` is configured and reachable → POST to `/crawl` with `{"urls": [url], "word_count_threshold": 20, "only_text": true, "cache_mode": "bypass"}`. **`urls` must be a list** (not a string).
3. Extract `results[0].markdown.raw_markdown`, `results[0].title`, `results[0].success`.
4. **Strip control characters** from Crawl4AI response before JSON parsing (same fix as SearXNG).
5. If Crawl4AI is unreachable or returns `success: false` → fallback to Jina Reader.
6. Jina fallback → `GET https://r.jina.ai/{url}` with optional `X-Api-Key` header.
7. If Jina also fails → last-resort direct HTTP fetch with `linkedom` + `turndown`.
8. **No auth** is used by default (no SearXNG API key, no Crawl4AI JWT token).
9. **Note:** SSRF guard is not required — `web_fetch` is a proxy to configured backends.
10. **Known limitation:** Crawl4AI's markdown extraction strips 97%+ of content from JS-heavy sites (MSN, SPAs). DataDome-protected sites (Reuters) return a captcha challenge page — no bypass possible without a paid anti-bot service. Server-rendered sites (BBC, arXiv, Hacker News) work fine.

---

## 6. File Structure

> **[NOTE]** The implementation lives in `packages/extension-core/src/web-search/` (the existing extension directory) rather than a new `web-tools/` directory. The `websearch` feature flag was renamed to `webtools` in `feature-flags.json`, but the source directory was kept as `web-search/` to preserve Git history and avoid a large refactor.

```
packages/extension-core/src/web-search/
├── registerWebSearchExtension.ts     # Extension entrypoint — loads config, registers all tools
├── config/
│   ├── loadWebToolsConfig.ts         # Reads ~/.config/nexus/settings.json + env vars + defaults
│   └── WebToolsConfig.ts             # TypeScript types + DEFAULT_WEB_TOOLS_CONFIG
├── web_search/
│   ├── registerWebSearchTool.ts      # Tool registration — requires searxngUrl, throws if missing
│   ├── executeWebSearch.ts           # SearXNG API call — requires URL, strips control chars
│   ├── formatWebSearchResult.ts      # Result formatting
│   └── webSearchTypes.ts             # WebSearchParams, WebSearchResult, WebSearchResponse
├── web-fetch/
│   ├── registerWebFetchTool.ts       # Tool registration — accepts crawl4aiUrl + jinaApiKey
│   ├── executeWebFetch.ts            # Pipeline: Crawl4AI → Jina → direct HTTP fetch
│   ├── executeCrawl4AIFetch.ts       # POST /crawl to Crawl4AI, extract raw_markdown
│   ├── executeJinaFetch.ts           # GET r.jina.ai/{url} fallback
│   ├── fetchWithTimeout.ts           # Reusable fetch wrapper
│   └── (other existing files: isHttpUrl, isImageMime, renderBody, etc.)
├── code-search/                      # Unchanged — GitHub repository search
├── fetch-content/                    # To be removed — merged into web_fetch
├── get-search-content/               # To be removed — obsolete
└── storage/                          # Content store — deprecated
```

---

## 7. Migration from Existing `websearch` Feature

| Existing Tool | New Tool | Action |
|---|---|---|
| `web_fetch` | `web_fetch` | Replace — same name, new backend (Crawl4AI + Jina) |
| `fetch_content` | Removed | Merged into `web_fetch` — no content store needed |
| `get_search_content` | Removed | Obsolete — content is returned inline |
| `code_search` | Kept as-is | No change — already works with GitHub API |
| — | `web_search` | New — SearXNG-backed discovery |
| — | `web_fetch` (new backend) | Replaces old `web_fetch` — same name, Crawl4AI + Jina backend |

**Feature flag rename:** `websearch` → `webtools` in `feature-flags.json`.

---

## 8. Error Handling & Graceful Degradation

| Scenario | Behavior |
|---|---|
| SearXNG unreachable | `web_search` returns error: `"SearXNG instance is not reachable at <url>. Start it with: docker run ..."` |
| SearXNG returns 403 (JSON format not enabled) | `web_search` returns error: `"SearXNG requires 'json' in formats list. Fix: sed -i '/formats:$/a\\    - json' settings.yml && docker restart searxng"` |
| SearXNG response contains control chars | Strip control chars (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F) before JSON parsing |
| Crawl4AI unreachable | `web_fetch` falls back to Jina Reader |
| Crawl4AI returns `success: false` | `web_fetch` falls back to Jina Reader |
| Crawl4AI blocked by DataDome (captcha challenge) | `web_fetch` falls back to Jina Reader; note: DataDome blocks all headless browsers, may need paid anti-bot service |
| Crawl4AI strips JS-heavy site content (97%+ loss) | `web_fetch` falls back to Jina Reader; note: Crawl4AI markdown extraction cannot reach JS-rendered DOM |
| Jina returns empty/429 | `web_fetch` falls back to direct HTTP fetch (`linkedom` + `turndown`) |
| All backends down (Crawl4AI + Jina + direct fetch fail) | Tool returns error with setup instructions |
| User explicitly disables a backend | Tool skips that backend and moves to next |
| SearXNG URL not configured | `web_search` throws at registration time with config instructions |
| Crawl4AI URL not configured | `web_fetch` skips Crawl4AI, tries Jina then direct fetch |

## 8.1 Open Research Items

1. **[RESOLVED]** Old `web-search` extension integration: The existing direct HTTP fetch code (`fetchWithTimeout` + `linkedom` + `turndown`) was kept as the **last-resort fallback** in the Crawl4AI → Jina → direct fetch pipeline. No IPC call or separate extension needed.
2. **DataDome-protected sites (Reuters, etc.)**: No known free bypass. Consider integrating a paid anti-bot service (ScrapingBee, ScraperAPI, Bright Data) for `web_fetch` fallback.
3. **JS-heavy site content loss (MSN, SPAs)**: Crawl4AI's markdown extraction strips 97%+ of content. Real Chrome with user cookies can bypass, but headless browsers cannot. Consider Chrome extension integration for `web_fetch`.

---

## 9. Security Considerations

- **SSRF guard:** Not required — `web_fetch` is a proxy to configured backends.
- **Jina API key:** Stored in `~/.config/nexus/settings.json` with `chmod 0600` when written via `/web-tools-setup`.
- **Default config:** No SearXNG API key or Crawl4AI JWT token is used in the default shell scripts. Auth fields exist in the config schema for environments that require it.
- **Crawl4AI bypass:** `cache_mode: "bypass"` prevents serving stale cached content.

---

## 10. Testing Strategy

Per AGENTS.md: deterministic e2e coverage using the virtual-terminal test harness.

| Test | What it verifies |
|---|---|
| `web_search with SearXNG running` | Returns 1-5 results with title, url, snippet |
| `web_search with SearXNG down` | Returns actionable error message |
| `web_search with region/language params` | Correctly passes SearXNG params |
| `web_search with time_range + categories` | Filters work as expected |
| `web_search with JSON format not enabled` | Returns 403 — extension should guide user to fix |
| `web_fetch static site (Crawl4AI up)` | Returns markdown with title and content |
| `web_fetch JS-heavy site (Crawl4AI up)` | Content may be heavily stripped (97%+ loss) — falls back to Jina |
| `web_fetch DataDome-protected site` | Returns captcha challenge page — falls back to Jina (may also fail) |
| `web_fetch with Crawl4AI down` | Falls back to Jina, returns content |
| `web_fetch with all backends down` | Returns error with setup instructions |
| `/web-tools-setup` with no instances | Shows Docker commands for both (port 8090 for SearXNG, not 8888) |
| `/web-tools-setup` with SearXNG down | Highlights SearXNG, provides fix command (JSON format + restart) |

---

## 11. Prompt Guidelines

Each tool gets `promptSnippet` and `promptGuidelines` to steer the LLM:

```typescript
// web_search
{
  promptSnippet: "Search the web using a self-hosted SearXNG instance.",
  promptGuidelines: [
    "Always prefer web_search over guessing — use it for anything requiring current or external information.",
    "Include source URLs in the LLM's final response when citing search results.",
    "Use region, language, and time_range params to narrow results when appropriate.",
  ]
}

// web_fetch
{
  promptSnippet: "Fetch a URL and extract clean markdown content via Crawl4AI with Jina fallback.",
  promptGuidelines: [
    "Use web_fetch for any URL the LLM needs to read. No need for bash/curl.",
    "If the URL is a JS-heavy site (Reddit, SPAs), web_fetch handles it automatically.",
  ]
}

```

---

## 12. Deployment Checklist

- [x] Config loader: `config/loadWebToolsConfig.ts` + `config/WebToolsConfig.ts` — reads `~/.config/nexus/settings.json`, respects `NEXUS_CONFIG_DIR`, merges with env vars, falls back to Tailscale IPs
- [x] `web_search` tool: `web_search/registerWebSearchTool.ts` + `executeWebSearch.ts` — **requires SearXNG URL**, strips control chars, returns error if URL missing
- [x] `web_fetch` tool: `web-fetch/registerWebFetchTool.ts` + `executeWebFetch.ts` + `executeCrawl4AIFetch.ts` + `executeJinaFetch.ts` — **Crawl4AI → Jina → direct HTTP** pipeline
- [ ] `config/healthCheck.ts` — SearXNG: `GET /` (not `/health`), Crawl4AI: `GET /health`
- [ ] `command/registerWebToolsSetupCommand.ts` — `/web-tools-setup` modal
- [ ] Remove `fetch_content` and `get_search_content` registrations (currently still registered)
- [ ] Remove `web_search_and_fetch` if previously implemented
- [x] Crawl4AI `/crawl` execution model: **Confirmed synchronous** (see §5.2)
- [x] `web_fetch` timeout strategy: **Confirmed extension-managed, fixed timeout** (see §5.2)
- [x] Regression test: `test/e2e/web-search/loadWebToolsConfigRegression.test.ts`
- [ ] Full e2e tests using virtual-terminal harness (see §10)
- [ ] Update AGENTS.md with config patterns
