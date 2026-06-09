import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCodeSearchTool } from "./code-search/registerCodeSearchTool.js";
import { registerFetchContentTool } from "./fetch-content/registerFetchContentTool.js";
import { registerGetSearchContentTool } from "./get-search-content/registerGetSearchContentTool.js";
import { registerWebFetchTool } from "./web-fetch/registerWebFetchTool.js";
import { registerWebSearchTool } from "./web_search/registerWebSearchTool.js";
import { loadWebToolsConfig } from "./config/loadWebToolsConfig.js";

/**
 * Registers Nexus-native web access tools without the pi-web-access vendor package.
 *
 * Loads web-tools configuration from `~/.config/nexus/config.json` (or
 * `$NEXUS_CONFIG_DIR/config.json`) and passes backend URLs to the tool
 * registrations so they target the configured instances.
 *
 * @param pi Pi extension API.
 */
export function registerWebSearchExtension(pi: ExtensionAPI): void {
  const config = loadWebToolsConfig();
  registerWebSearchTool(pi, config.searxng.url);
  registerWebFetchTool(pi, config.crawl4ai.url, config.jina.apiKey);
  registerCodeSearchTool(pi);
  registerFetchContentTool(pi);
  registerGetSearchContentTool(pi);
}
