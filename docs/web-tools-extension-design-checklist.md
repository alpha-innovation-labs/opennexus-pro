# Web Tools Extension — Implementation Checklist

Each item below is a self-contained task. Complete them in order (config before tools, tools before registration).

---

## Task 1 — Create Directory Structure and Package Entrypoint

Create `packages/extension-core/src/web-tools/` with the following subdirectories: `config/`, `tools/web_search/`, `tools/web_fetch/`, `command/`, and `shared/`. Write `registerWebToolsExtension.ts` as the package entrypoint that imports and registers all tools and the setup command. This file is the single registration point called from `src/extensions/index.ts`.

---

## Task 2 — Implement Configuration Loader (`config/loadWebToolsConfig.ts`)

Read `~/.config/nexus/web-tools.json` (or `$NEXUS_CONFIG_DIR/web-tools.json` if the `NEXUS_CONFIG_DIR` env var is set) and merge it with environment variable overrides (`SEARXNG_URL`, `SEARXNG_API_KEY`, `CRAWL4AI_URL`, `CRAWL4AI_TOKEN`, `JINA_API_KEY`). In dev mode, also check `.nexus/web-tools.json` in the project root as a project-local override. Environment variables take precedence over the config file, which takes precedence over defaults. Write `config/WebToolsConfig.ts` with TypeScript types for the merged config shape. Validate that URLs are well-formed and warn if API keys are missing for services that require them.

---

## Task 3 — Implement Startup Health Checks (`config/healthCheck.ts`)

On extension registration, call SearXNG (`GET /` — note: SearXNG has no `/health` endpoint) and Crawl4AI (`GET /health`). Log a warning if either is unreachable, but do not fail startup. If SearXNG is down, `web_search` will return a descriptive error. If Crawl4AI is down, `web_fetch` silently falls back to Jina. Expose a `/web-tools-setup` slash command when backends are unreachable.

---

## Task 4 — Implement `web_search` Tool (`tools/web_search/`)

Create three files: `registerWebSearchTool.ts` (tool registration), `executeWebSearch.ts` (SearXNG API call), and `formatWebSearchResult.ts` (result formatting). The tool sends `GET /search?q=QUERY&format=json&limit=N` to the SearXNG instance with `User-Agent: Nexus-WebTools/1.0`. **Critical:** Strip control characters (0x00–0x08, 0x0B, 0x0C, 0x0E–0x1F) from the response before JSON parsing — SearXNG responses contain control chars that break parsers. Support optional parameters: `max_results`, `region`, `language`, `time_range`, `categories`, `engines`, `safe_search`. Return up to 10 results as title/url/snippet tuples.

---

## Task 5 — Implement `web_fetch` Tool (`tools/web_fetch/`)

Create five files: `registerWebFetchTool.ts`, `executeWebFetch.ts` (main pipeline), `executeCrawl4AIFetch.ts` (Crawl4AI POST), `executeJinaFetch.ts` (Jina GET), and `formatWebFetchResult.ts`. The pipeline: (1) POST to Crawl4AI `/crawl` with `{"urls": [url], "cache_mode": "bypass", "word_count_threshold": 20, "only_text": true}` — `urls` must be a list, not a string. Crawl4AI is synchronous, blocking ~10–30s for JS-heavy pages. (2) Extract `results[0].markdown.raw_markdown`. (3) If Crawl4AI is unreachable or returns `success: false`, fall back to Jina Reader (`GET https://r.jina.ai/{url}` with `X-Api-Key` header). (4) If `raw: true`, return raw HTML/JSON. (5) Apply a fixed internal timeout — no LLM-controllable timeout parameter. Support optional `format` parameter (`text`, `markdown`, `html`).

---

## Task 6 — Implement Batch URL Crawling for `web_fetch`

Extend `executeCrawl4AIFetch.ts` to accept multiple URLs in a single POST request. When the LLM requests multiple fetches in one turn, batch them into one Crawl4AI call. Map each URL to its corresponding result in `results[]` by index. This reduces latency for multi-URL fetches without changing the tool's external API.

---

## Task 7 — Implement Setup Command (`command/registerWebToolsSetupCommand.ts`)

Create a slash command `/web-tools-setup` that opens a modal showing the reachability status of each backend (SearXNG, Crawl4AI, Jina). Display verified Docker commands for starting missing instances: SearXNG on port 8090 (not 8888), Crawl4AI on port 11235. Allow the user to edit URLs inline and persist changes to `~/.config/nexus/web-tools.json` (or `$NEXUS_CONFIG_DIR/web-tools.json`) with `chmod 0600`. When SearXNG is down, show the fix command: `sed -i '/formats:$/a\    - json' settings.yml && docker restart searxng`.

---

## Task 8 — Implement Shared Utilities (`shared/`)

Create `shared/fetchWithTimeout.ts` — a reusable fetch wrapper with configurable timeout. Create `shared/constants.ts` — default URLs (`http://localhost:8090` for SearXNG, `http://localhost:11235` for Crawl4AI), timeouts, and user-agent strings. Remove or mark as deprecated `shared/createResponseId.ts` (content store was dropped).

---

## Task 9 — Rename Feature Flag and Update Registration

In `feature-flags.json`, rename `websearch` to `webtools`. In `src/extensions/index.ts`, replace the old `websearch` registration with the new `webtools` registration. Remove registrations for `fetch_content` and `get_search_content` (merged into `web_fetch`). Keep `code_search` registration unchanged. Remove `web_search_and_fetch` if it was previously implemented.

---

## Task 10 — Write Deterministic E2E Tests and Proper Test Definition

Write e2e tests using the virtual-terminal test harness covering all 12 scenarios from the design document: (1) `web_search` with SearXNG running returns 1–5 results; (2) `web_search` with SearXNG down returns actionable error; (3) `web_search` with region/language params; (4) `web_search` with time_range + categories; (5) `web_search` with JSON format not enabled returns 403; (6) `web_fetch` static site returns markdown; (7) `web_fetch` JS-heavy site falls back to Jina; (8) `web_fetch` DataDome-protected site falls back to Jina (may also fail); (9) `web_fetch` with Crawl4AI down falls back to Jina; (10) `web_fetch` with all backends down returns error; (11) `/web-tools-setup` with no instances shows Docker commands; (12) `/web-tools-setup` with SearXNG down shows fix command.

A proper test for this extension is defined as the ability to run the following command and receive a meaningful response:

```
just dev -p "run a websearch for the latest iran war updates. if you don't have a built int search tool say so, and if the tool fails, report the error"
```

This command must exercise the full user-facing path: the LLM decides to invoke `web_search`, the tool executes against the configured backend, and the result (or error) is surfaced to the user. If no search tool is available, the LLM must explicitly state so. If the tool fails, the error must be reported, not swallowed.

---

## Task 11 — Update AGENTS.md

Add any new patterns or conventions discovered during implementation to `AGENTS.md`. Document the web-tools extension location (`packages/extension-core/src/web-tools/`), the config file path (`~/.config/nexus/web-tools.json`, or `$NEXUS_CONFIG_DIR/web-tools.json`), the feature flag name (`webtools`), and any new guidelines for backend management, health checks, or error handling that future extensions should follow.

---

## Task 12 — Resolve Open Research Items (Post-Implementation)

After the core implementation, address three open items: (1) Decide how the old `./packages/extension-core/web-search` extension integrates — either via programmatic IPC call, feature-flag disable, or merge into webtools. (2) Evaluate paid anti-bot services (ScrapingBee, ScraperAPI, Bright Data) for DataDome-protected sites. (3) Investigate Chrome extension integration for JS-heavy site content loss (Crawl4AI strips 97%+ of content from SPAs). These are tracked as follow-up issues, not blockers for the initial release.
