import { readProjectSettings } from "./readProjectSettings.js";
import { writeProjectSettings } from "./writeProjectSettings.js";

/**
 * Persists the selected project theme.
 *
 * @param cwd Project cwd.
 * @param themeName Theme name.
 */
export async function setProjectTheme(cwd: string, themeName: string): Promise<void> {
  const settings = await readProjectSettings(cwd);
  settings.theme = themeName;
  await writeProjectSettings(cwd, settings);
}
