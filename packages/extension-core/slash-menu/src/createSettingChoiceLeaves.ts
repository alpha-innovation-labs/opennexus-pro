import type { SlashMenuLeaf } from "./types";

/**
 * Builds choice leaves for one configurable setting.
 *
 * @param settingLeaf Setting leaf with option metadata.
 * @returns Choice leaves with current selection markers.
 */
export function createSettingChoiceLeaves(settingLeaf: SlashMenuLeaf): SlashMenuLeaf[] {
  return (settingLeaf.options ?? []).map((option) => ({
    kind: "choice",
    label: `${option === settingLeaf.currentValue ? "◉" : "○"} ${option}`,
    description: "",
    value: option,
    currentValue: settingLeaf.currentValue,
  }));
}
