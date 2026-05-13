import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { Api, Model } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "../types.js";
import { createProviderQualifiedModelLabel } from "./createProviderQualifiedModelLabel.js";

const AVAILABLE_MODEL_LABEL_WIDTH = 52;

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
    label: `${reference}${isCurrentModel ? " ✓" : ""}`,
    description: model.name,
    groupLabel: "Available Models",
    value: reference,
    fixedLabelWidth: AVAILABLE_MODEL_LABEL_WIDTH,
  };
}
