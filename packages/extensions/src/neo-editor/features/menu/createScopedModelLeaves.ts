import { SettingsManager } from "../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds scoped-model leaves from persisted settings.
 *
 * @param ctx Extension context.
 * @returns Scoped-model leaves.
 */
export function createScopedModelLeaves(ctx: ExtensionContext): SlashMenuLeaf[] {
  const enabled = new Set(SettingsManager.create(ctx.cwd).getEnabledModels() ?? []);
  return ctx.modelRegistry.getAvailable().map((model) => {
    const value = `${model.provider}/${model.id}`;
    return {
      kind: "model",
      label: `${enabled.size === 0 || enabled.has(value) ? "✓" : "○"} ${model.id}`,
      description: "",
      groupLabel: model.provider,
      value,
    };
  });
}
