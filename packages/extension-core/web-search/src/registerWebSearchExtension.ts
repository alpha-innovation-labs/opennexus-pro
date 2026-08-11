import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { loadWebToolsConfig } from "./config/loadWebToolsConfig";
import { registerWebSearchTool } from "./searxng/registerWebSearchTool";
import { registerWebFetchTool } from "./web-fetch/registerWebFetchTool";

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
	registerWebSearchTool(pi, config.websearch.searxng.url);
	registerWebFetchTool(
		pi,
		config.websearch.crawl4ai.url,
		config.websearch.jina.apiKey,
	);
}
