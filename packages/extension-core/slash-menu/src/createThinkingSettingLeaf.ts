import { getSupportedThinkingLevels } from "@earendil-works/pi-ai";
import type { Api, Model } from "@earendil-works/pi-ai";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds the shared thinking-level setting leaf for settings and root menu flows.
 *
 * @param thinkingLevel Current session thinking level.
 * @param model Current session model metadata.
 * @returns Thinking-level setting leaf.
 */
export function createThinkingSettingLeaf(
  thinkingLevel: string,
  model: Model<Api> | undefined,
): SlashMenuLeaf {
  const options = model === undefined ? ["off"] : getSupportedThinkingLevels(model);

  return {
    kind: "setting",
    label: "Thinking level",
    description: "Reasoning depth for thinking-capable models",
    value: "thinking",
    currentValue: thinkingLevel,
    options,
  };
}
