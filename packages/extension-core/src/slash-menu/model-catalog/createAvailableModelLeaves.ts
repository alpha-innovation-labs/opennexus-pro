import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "../types.js";
import { createAvailableModelLeaf } from "./createAvailableModelLeaf.js";

/**
 * Builds the top available-model section from authenticated registry entries.
 *
 * @param ctx Extension context with the live model registry.
 * @returns Sorted available-model slash-menu leaves.
 */
export function createAvailableModelLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
  return ctx.modelRegistry.getAvailable()
    .map((model) => createAvailableModelLeaf(model as never, ctx))
    .sort((left, right) => (left.groupLabel?.localeCompare(right.groupLabel ?? "") || left.label.localeCompare(right.label)));
}
