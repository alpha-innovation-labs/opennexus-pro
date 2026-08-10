import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Api, Model } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types";
import { createProviderQualifiedModelLabel } from "./createProviderQualifiedModelLabel";

/**
 * Creates one available-model slash-menu row.
 *
 * @param model Available model from the live model registry.
 * @param ctx Extension context with the active model selection.
 * @returns Slash-menu leaf for the available section.
 */
export function createAvailableModelLeaf(model: Model<Api>, ctx: ExtensionContext): SlashMenuLeaf {
  const reference = createProviderQualifiedModelLabel(model);
  const isCurrentModel = ctx.model?.provider === model.provider && ctx.model?.id === model.id;
  return {
    kind: "model",
    label: `${model.id}${isCurrentModel ? " ✓" : ""}`,
    description: "",
    groupLabel: model.provider,
    value: reference,
  };
}
