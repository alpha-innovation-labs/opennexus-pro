import { getDefaultThemeName } from "@nexus/runtime/config/getDefaultThemeName.js";
import { readProjectConfig } from "./readProjectConfig.js";

/**
 * Reads the active project theme name.
 *
 * @param cwd Project cwd.
 * @returns Active theme name.
 */
export async function readProjectTheme(cwd: string): Promise<string> {
  const projectConfig = await readProjectConfig(cwd);
  return typeof projectConfig.theme === "string" && projectConfig.theme.trim() ? projectConfig.theme : getDefaultThemeName();
}
