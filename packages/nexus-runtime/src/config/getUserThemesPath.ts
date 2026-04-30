import { join } from "node:path";
import { getUserConfigDirPath } from "./getUserConfigDirPath.js";

/**
 * Resolves the Nexus global user themes directory path.
 *
 * @returns Absolute user themes directory path.
 */
export function getUserThemesPath(): string {
  return join(getUserConfigDirPath(), "themes");
}
