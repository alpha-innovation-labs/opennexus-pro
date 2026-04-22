import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds model selector leaves from the live model registry.
 *
 * @param ctx Extension context.
 * @returns Model leaves.
 */
export function createModelLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
  return ctx.modelRegistry.getAvailable().map((model) => ({
    kind: "model",
    label: `${model.id} [${model.provider}]${ctx.model?.provider === model.provider && ctx.model?.id === model.id ? " ✓" : ""}`,
    description: model.name,
    value: `${model.provider}/${model.id}`,
  }));
}
