import { SettingsManager } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "./types.js";

// getAvailableThemes is not exported from the package — stub with known themes.
function getAvailableThemes(): string[] {
  return ["dark", "light"];
}

/**
 * Builds theme submenu entries from the Pi runtime theme registry.
 *
 * @param cwd Project cwd.
 * @returns Theme leaf entries.
 */
export async function createThemeLeaves(cwd: string): Promise<SlashMenuLeaf[]> {
  const settings = SettingsManager.create(cwd);
  const activeTheme = settings.getTheme() || "dark";
  return getAvailableThemes().map((name) => ({
    kind: "theme",
    label: name,
    description: name === activeTheme ? "Current theme." : "Set theme.",
    value: name,
    currentValue: name,
  }));
}
