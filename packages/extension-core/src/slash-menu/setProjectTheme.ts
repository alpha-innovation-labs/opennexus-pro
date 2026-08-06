import { readProjectConfig } from "./readProjectConfig.js";
import { writeProjectConfig } from "./writeProjectConfig.js";

/**
 * Persists the selected project theme.
 *
 * @param cwd Project cwd.
 * @param themeName Theme name.
 */
export async function setProjectTheme(cwd: string, themeName: string): Promise<void> {
  const projectConfig = await readProjectConfig(cwd);
  (projectConfig as { theme?: string }).theme = themeName;
  await writeProjectConfig(cwd, projectConfig);
}
