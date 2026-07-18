import type { SlashMenuState } from "../state.ts";
import type { SlashMenuLeaf, SlashMenuSection } from "../types.ts";
import { getSlashMenuLevelTitle } from "../../getSlashMenuLevelTitle.ts";
import { getSettingChoiceTitle } from "../../getSettingChoiceTitle.ts";
import { createResumeScopeHeaderTitle } from "../../resume-scope/createResumeScopeHeaderTitle.ts";
import { renderModelMenuTabs } from "../../model-catalog/renderModelMenuTabs.ts";
import { renderResourceCommandScopeTabs } from "../../renderResourceCommandScopeTabs.ts";
import { filterMenuItems } from "../../filterMenuItems.ts";
import { formatVisibleItem } from "./formatVisibleItem.ts";
import { createSlashMenuPreviewLines } from "../../createSlashMenuPreviewLines.ts";
import { toAutocompleteItems } from "../../toAutocompleteItems.ts";
import { shouldShowSlashMenuPreview } from "../../shouldShowSlashMenuPreview.ts";

/**
 * Given state + items, returns everything the class needs to call to render.
 * Pure function — no side effects.
 */
export interface RenderConfig {
  leftTitle: string;
  rightTitle: string;
  headerFocusMarkers: boolean;
  items: unknown[];
  previewLines: string[];
  selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection;
  onSelectionChange: (item: unknown) => { previewLines: string[]; selectedPreviewItem?: SlashMenuLeaf | SlashMenuSection };
}

export function renderItems(state: SlashMenuState, items: Array<SlashMenuLeaf | SlashMenuSection>): RenderConfig {
  // Titles
  let leftTitle: string;
  let rightTitle: string;

  if (state.level === "resume") {
    leftTitle = createResumeScopeHeaderTitle(state.resumeScope);
    rightTitle = "";
  } else if (state.level === "model") {
    leftTitle = renderModelMenuTabs(state.modelMenuTab);
    rightTitle = "";
  } else {
    leftTitle = getSlashMenuLevelTitle(state.level);
    rightTitle = (state.level === "prompts" || state.level === "skills")
      ? renderResourceCommandScopeTabs(state.resourceScope)
      : "Preview";
  }

  const headerFocusMarkers = state.level !== "prompts" && state.level !== "skills" && state.level !== "model";

  const formattedItems = toAutocompleteItems(
    items.map((item) => formatVisibleItem(item, state)),
  );

  const selectedPreviewItem = items[0];
  const previewLines = selectedPreviewItem
    ? createSlashMenuPreviewLines(state.level, selectedPreviewItem)
    : ["No matching items."];

  const onSelectionChange = (item: unknown) => {
    const selected = items.find((e) => (e as { value: string }).value === (item as { value: string })?.value);
    return {
      previewLines: selected ? createSlashMenuPreviewLines(state.level, selected) : ["No matching items."],
      selectedPreviewItem: selected,
    };
  };

  return { leftTitle, rightTitle, headerFocusMarkers, items: formattedItems, previewLines, selectedPreviewItem, onSelectionChange };
}
