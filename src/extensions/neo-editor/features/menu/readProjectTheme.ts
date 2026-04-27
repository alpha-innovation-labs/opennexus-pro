import { getDefaultThemeName } from "../../../../runtime/config/getDefaultThemeName.js";
import { readProjectSettings } from "./readProjectSettings.js";

/**
 * Reads the active project theme name.
 *
 * @param cwd Project cwd.
 * @returns Active theme name.
 */
export async function readProjectTheme(cwd: string): Promise<string> {
  const settings = await readProjectSettings(cwd);
  return typeof settings.theme === "string" && settings.theme.trim() ? settings.theme : getDefaultThemeName();
}
