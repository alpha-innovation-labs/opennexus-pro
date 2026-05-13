import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createAvailableModelLeaves } from "./model-catalog/createAvailableModelLeaves.js";
import { createModelCatalogLeaves } from "./model-catalog/createModelCatalogLeaves.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds model selector leaves from live availability followed by the full Pi model catalog.
 *
 * @param ctx Extension context.
 * @returns Model leaves.
 */
export function createModelLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
  return [
    ...createAvailableModelLeaves(ctx),
    ...createModelCatalogLeaves(),
  ];
}
