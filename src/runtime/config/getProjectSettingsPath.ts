import { join } from "node:path";
import { getProjectConfigDirPath } from "./getProjectConfigDirPath.js";

/**
 * Resolves the Nexus project settings file path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project settings file path.
 */
export function getProjectSettingsPath(cwd: string): string {
  return join(getProjectConfigDirPath(cwd), "settings.json");
}
