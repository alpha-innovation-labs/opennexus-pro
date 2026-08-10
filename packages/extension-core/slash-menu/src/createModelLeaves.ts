import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createModelMenuLeaves } from "./model-catalog/createModelMenuLeaves.js";
import type { ModelMenuTab } from "./model-catalog/ModelMenuTab.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds model selector leaves for one model-menu tab.
 *
 * @param ctx Extension context.
 * @param tab Active model-menu tab.
 * @returns Model leaves.
 */
export function createModelLeaves(ctx: ExtensionContext, tab: ModelMenuTab = "models"): SlashMenuLeaf[] {
  return createModelMenuLeaves(ctx, tab);
}
