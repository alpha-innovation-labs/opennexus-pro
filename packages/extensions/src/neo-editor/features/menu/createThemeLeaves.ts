import { SettingsManager } from "../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { getAvailableThemes } from "../../../../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";
import type { SlashMenuLeaf } from "./types.js";

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
