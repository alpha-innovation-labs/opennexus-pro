import type { ModelMenuTab } from "./ModelMenuTab.js";

/**
 * Returns the ordered slash model-menu tabs.
 *
 * @returns Model-menu tab ids.
 */
export function createModelMenuTabs(): ModelMenuTab[] {
  return ["models", "all-models"];
}
