import type { SlashMenuLeaf } from "./types";

/**
 * Formats the title for a setting choice submenu.
 *
 * @param settingLeaf Parent setting leaf.
 * @returns Choice submenu title.
 */
export function getSettingChoiceTitle(
	settingLeaf: SlashMenuLeaf | undefined,
): string {
	return settingLeaf ? `Settings > ${settingLeaf.label}` : "Settings";
}
