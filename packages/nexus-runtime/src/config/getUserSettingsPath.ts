import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath.js";

/**
 * Resolves the Nexus global user settings file path.
 *
 * @returns Absolute user settings file path.
 */
export function getUserSettingsPath(): string {
  return join(getUserConfigDirPath(), "settings.json");
}
