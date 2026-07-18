import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuState } from "../state.ts";
import type { SlashMenuLevel } from "../SlashMenuLevel.ts";
import type { SlashMenuLeaf } from "../types.ts";
import { createLoadingLeaf } from "../../createLoadingLeaf.ts";
import { createScopedModelLeaves } from "../../createScopedModelLeaves.ts";
import { resolveRequestedSlashMenuLevel } from "../../resolveRequestedSlashMenuLevel.ts";
import { createThinkingSettingLeaf } from "../../createThinkingSettingLeaf.ts";

/**
 * Returns the panel configuration to open, or null for normal navigation.
 * Pure function.
 */
export type OpenPanelConfig =
  | { type: "close" }
  | { type: "navigate"; level: string; isModel?: boolean }
  | { type: "openPanel"; name: string; payload?: unknown };

export function openLevelConfig(
  state: SlashMenuState,
  ctx: ExtensionContext,
  level: string,
): OpenPanelConfig {
  if (level === "model") {
    return { type: "navigate", level, isModel: true };
  }
  if (level === "scoped-models") {
    const leaves = createScopedModelLeaves(ctx);
    const scopedSelection = new Set(
      leaves.filter((l) => l.label.startsWith("✓")).map((l) => l.value),
    );
    return { type: "navigate", level, scopedSelection };
  }
  if (level === "resume") {
    return { type: "navigate", level, resumeScope: "current" };
  }
  return { type: "navigate", level };
}

/**
 * Returns the panel to open for special top-level items.
 * Pure function.
 */
export function openPanelForItem(
  itemValue: string,
  getThinkingLevel: () => string,
  ctx: ExtensionContext,
): OpenPanelConfig | null {
  switch (itemValue) {
    case "hotkeys": return { type: "openPanel", name: "hotkeys" };
    case "name": return { type: "openPanel", name: "name-input" };
    case "session": return { type: "openPanel", name: "session-info" };
    case "thinking": {
      const leaf = createThinkingSettingLeaf(getThinkingLevel(), ctx.model as never);
      return { type: "openPanel", name: "thinking-setting", payload: leaf };
    }
    default: return null;
  }
}
