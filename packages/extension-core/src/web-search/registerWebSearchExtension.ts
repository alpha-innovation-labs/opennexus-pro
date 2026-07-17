import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerWebFetchTool } from "./web-fetch/registerWebFetchTool.js";
import { registerWebSearchTool } from "./searxng/registerWebSearchTool.js";
import { loadWebToolsConfig } from "./config/loadWebToolsConfig.js";

/**
 * Registers Pi-native web access tools.
 *
 * Loads web-tools configuration from Nexus's shared config file and passes backend URLs to the tool
 * registrations so they target the configured instances.
 *
 * @param pi Pi extension API.
 */
export function registerWebSearchExtension(pi: ExtensionAPI): void {
  const config = loadWebToolsConfig();
  registerWebSearchTool(pi, config.searxng.url);
  registerWebFetchTool(pi, config.crawl4ai.url, config.jina.apiKey);
}
