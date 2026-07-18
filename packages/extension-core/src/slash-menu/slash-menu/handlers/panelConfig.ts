import type { SlashMenuState } from "../state.ts";
import type { SlashMenuLeaf, SlashMenuSection } from "../types.ts";

/**
 * Returns the panel config for the current level + payload.
 * Pure function.
 */
export interface PanelConfig {
  name: string;
  payload?: unknown;
  preRender?: (state: SlashMenuState) => void;
}

export function getPanelConfig(name: string, payload?: unknown): PanelConfig {
  switch (name) {
    case "hotkeys": return { name: "hotkeys" };
    case "name-input": return {
      name: "name-input",
      preRender: (s) => { s.level = "name-input"; s.query = ""; s.searchActive = false; },
    };
    case "session-info": return { name: "session-info" };
    case "thinking-setting": case "setting-choice": {
      const leaf = payload as SlashMenuLeaf;
      return {
        name: "setting-choice",
        payload,
        preRender: (s) => { s.pendingSettingLeaf = leaf; },
      };
    }
    default: return { name };
  }
}
