import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds model selector leaves from the live model registry.
 *
 * @param ctx Extension context.
 * @returns Model leaves.
 */
export function createModelLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
  return ctx.modelRegistry.getAvailable().map((model) => ({
    kind: "model" as const,
    label: `${model.id}${ctx.model?.provider === model.provider && ctx.model?.id === model.id ? " ✓" : ""}`,
    description: model.name,
    groupLabel: model.provider,
    value: `${model.provider}/${model.id}`,
  })).sort((left, right) => (left.groupLabel.localeCompare(right.groupLabel) || left.label.localeCompare(right.label)));
}
