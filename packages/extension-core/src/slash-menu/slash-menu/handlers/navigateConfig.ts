import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuState } from "../state.ts";
import { createLoadingLeaf } from "../../createLoadingLeaf.ts";
import { createScopedModelLeaves } from "../../createScopedModelLeaves.ts";
import { resolveRequestedSlashMenuLevel } from "../../resolveRequestedSlashMenuLevel.ts";

/**
 * Returns the UI config needed to navigate to a level.
 * Pure function.
 */
export interface NavigateConfig {
  level: string;
  isModel: boolean;
  scopedSelection?: Set<string>;
  resumeScope?: string;
  preRender?: (state: SlashMenuState) => void;
  postRender?: (state: SlashMenuState, ui: {
    setBottom: (t: string, v: string, p: string) => void;
    requestRender: () => void;
  }) => void;
}

export function buildNavigateConfig(
  state: SlashMenuState,
  ctx: ExtensionContext,
  level: string,
): NavigateConfig {
  if (level === "model") {
    return {
      level,
      isModel: true,
      preRender: (s) => {
        s.level = "model";
        s.modelMenuTab = "models";
        s.query = "";
        s.searchActive = false;
      },
      postRender: (s, ui) => {
        ui.setBottom("Search", "", "> /");
        // The caller handles: setTitles("Loading",""), setItems([createLoadingLeaf(...)]), requestRender()
      },
    };
  }
  const scopedSelection = level === "scoped-models"
    ? new Set(createScopedModelLeaves(ctx).filter((l) => l.label.startsWith("✓")).map((l) => l.value))
    : undefined;
  const resumeScope = level === "resume" ? "current" : undefined;
  return { level, isModel: false, scopedSelection, resumeScope };
}
