import { parseCommandArgs } from "@earendil-works/pi-coding-agent/dist/core/prompt-templates.js";
import { SENTINEL } from "@nexus/pi-platform/prompt-templates/applyPromptTemplateArgAppendPatch.js";
import type { SlashMenuState } from "../state.ts";
import type { SlashMenuLeaf, SlashMenuSection } from "../types.ts";
import { resolveModelCatalogCommandValue } from "../../model-catalog/resolveModelCatalogCommandValue.ts";
import { encodeSlashMenuValue } from "../../encodeSlashMenuValue.ts";
import { createThinkingSettingLeaf } from "../../createThinkingSettingLeaf.ts";

/**
 * Given the current level and selected item, returns what action to take.
 * Pure function — no side effects. The class reads this and applies it.
 */
export type HandleEnterAction =
  | { type: "close" }
  | { type: "navigate"; level: string }
  | { type: "toggle"; value: string }
  | { type: "command"; commandText: string }
  | { type: "prefill"; commandText: string }
  | { type: "openPanel"; panelName: string; payload?: unknown };

export function handleEnter(
  state: SlashMenuState,
  item: { value: string },
): HandleEnterAction | null {
  switch (state.level) {
    case "top":
      return handleTopLevel(state, item);
    case "settings":
      return handleSettingsLevel(state, item);
    case "setting-choice":
      return { type: "applySetting", value: item.value };
    case "theme":
      return { type: "applyLeaf", value: item.value };
    case "model":
      if (item.value === "__loading__") return null;
      return { type: "command", commandText: `/nexus-model-select ${resolveModelCatalogCommandValue(item.value)}` };
    case "scoped-models":
      return { type: "toggle", value: item.value };
    case "fork":
      return { type: "command", commandText: `/nexus-fork-select ${item.value}` };
    case "resume":
      return { type: "command", commandText: `/nexus-resume-select ${encodeSlashMenuValue(item.value)}` };
    case "prompts":
    case "skills":
      return handleResourceLevel(state, item);
    case "tools":
      return null;
    case "login":
    case "login-providers":
      return { type: "command", commandText: `/nexus-login-select ${item.value}` };
    case "logout":
      return { type: "logout", providerId: item.value };
    default:
      return null;
  }
}

function handleTopLevel(state: SlashMenuState, item: { value: string }): HandleEnterAction {
  if (item.value === "hotkeys") return { type: "openPanel", panelName: "hotkeys" };
  if (item.value === "name") return { type: "openPanel", panelName: "name-input" };
  if (item.value === "session") return { type: "openPanel", panelName: "session-info" };
  if (item.value === "thinking") {
    return { type: "openPanel", panelName: "thinking-setting" };
  }
  const topItem = (state.topItems as Array<{ value: string; groupLabel?: string }>)
    .find((e) => e.value === item.value);
  if (topItem?.groupLabel === "Custom Commands") {
    return { type: "prefill", commandText: `/${item.value} ` };
  }
  return { type: "navigateToTop", value: item.value };
}

function handleSettingsLevel(state: SlashMenuState, item: { value: string }): HandleEnterAction | null {
  if (item.value === "theme") return { type: "navigate", level: "theme" };
  const leaf = state.activeLeaves.find((e) => e.value === item.value);
  if (!leaf) return null;
  if ((leaf.options?.length ?? 0) > 0) {
    return { type: "openPanel", panelName: "setting-choice", payload: leaf };
  }
  return { type: "applyLeaf", value: item.value };
}

function handleResourceLevel(state: SlashMenuState, item: { value: string }): HandleEnterAction {
  const args = extractSlashArgs(state, item.value);
  const text = args ? `/${item.value} ${args.trim()}${SENTINEL}` : item.value;
  return state.level === "skills"
    ? { type: "command", commandText: text }
    : { type: "prefill", commandText: text };
}
