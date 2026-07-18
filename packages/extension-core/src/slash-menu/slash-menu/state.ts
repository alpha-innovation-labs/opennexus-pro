import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLevel } from "../SlashMenuLevel.ts";
import type { SlashMenuLeaf, SlashMenuSection } from "../types.ts";

/** All mutable state for the slash menu, extracted from SlashMenuModal. */
export interface SlashMenuState {
  level: SlashMenuLevel;
  query: string;
  topItems: Array<SlashMenuLeaf | SlashMenuSection>;
  activeLeaves: SlashMenuLeaf[];
  nameInput: string;
  pendingSettingLeaf?: SlashMenuLeaf;
  scopedSelection: Set<string>;
  searchActive: boolean;
  selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection;
  previousLevels: SlashMenuLevel[];
  resumeScope: string;
  resourceScope: string;
  modelMenuTab: string;
}

/** Creates fresh state with defaults. */
export function createSlashMenuState(): SlashMenuState {
  return {
    level: "top",
    query: "",
    topItems: [],
    activeLeaves: [],
    nameInput: "",
    scopedSelection: new Set<string>(),
    searchActive: false,
    previousLevels: [],
    resumeScope: "current",
    resourceScope: "all",
    modelMenuTab: "models",
  };
}
