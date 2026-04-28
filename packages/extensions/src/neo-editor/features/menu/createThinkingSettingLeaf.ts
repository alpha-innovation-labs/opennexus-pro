import { supportsXhigh } from "@mariozechner/pi-ai";
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
  model: { reasoning?: boolean } | undefined,
): SlashMenuLeaf {
  const options = !model?.reasoning
    ? ["off"]
    : supportsXhigh(model as never)
      ? ["off", "minimal", "low", "medium", "high", "xhigh"]
      : ["off", "minimal", "low", "medium", "high"];

  return {
    kind: "setting",
    label: "Thinking level",
    description: "Reasoning depth for thinking-capable models",
    value: "thinking",
    currentValue: thinkingLevel,
    options,
  };
}
