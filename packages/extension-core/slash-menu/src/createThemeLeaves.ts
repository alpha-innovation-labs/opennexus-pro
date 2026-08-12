import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { readThemes } from "@nexus/runtime";
import type { SlashMenuLeaf } from "./types";

/**
 * Builds theme submenu entries from the Pi runtime theme registry.
 *
 * @param cwd Project cwd.
 * @returns Theme leaf entries.
 */
export async function createThemeLeaves(cwd: string): Promise<SlashMenuLeaf[]> {
	const settings = SettingsManager.create(cwd);
	const activeTheme = settings.getTheme() || "dark";
	const themeNames = await readThemes(cwd);
	return themeNames.map((name) => ({
		kind: "theme",
		label: name,
		description: name === activeTheme ? "Current theme." : "Set theme.",
		value: name,
		currentValue: name,
	}));
}
