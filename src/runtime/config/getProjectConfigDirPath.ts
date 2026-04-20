import { resolve } from "node:path";
import { getProjectConfigDirName } from "./getProjectConfigDirName.js";

/**
 * Resolves the Nexus project config directory path.
 *
 * @param cwd Project working directory.
 * @returns Absolute project config directory path.
 */
export function getProjectConfigDirPath(cwd: string): string {
  return resolve(cwd, getProjectConfigDirName());
}
