import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { registerCodeSearchTool } from "./code-search/registerCodeSearchTool.js";
import { registerFetchContentTool } from "./fetch-content/registerFetchContentTool.js";
import { registerGetSearchContentTool } from "./get-search-content/registerGetSearchContentTool.js";
import { registerWebFetchTool } from "./web-fetch/registerWebFetchTool.js";

/**
 * Registers Nexus-native web access tools without the pi-web-access vendor package.
 *
 * @param pi Pi extension API.
 */
export function registerWebSearchExtension(pi: ExtensionAPI): void {
  registerWebFetchTool(pi);
  registerCodeSearchTool(pi);
  registerFetchContentTool(pi);
  registerGetSearchContentTool(pi);
}
