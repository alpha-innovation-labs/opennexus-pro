import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { readThemes } from "@nexus/runtime/config/readThemes";

/**
 * Sets the active project theme by name, persisting to the agent
 * directory settings via Pi's SettingsManager.
 *
 * @param themeName Theme name to set.
 * @returns 0 on success, 1 on error.
 */
export async function setTheme(themeName: string): Promise<number> {
  const names = await readThemes(process.cwd());
  if (!names.includes(themeName)) {
    console.error(`Error: unknown theme "${themeName}"`);
    console.error(`Available themes: ${names.join(", ")}`);
    return 1;
  }

  const settings = SettingsManager.create(process.cwd());
  settings.setTheme(themeName);
  console.log(`Theme set to "${themeName}"`);
  return 0;
}
