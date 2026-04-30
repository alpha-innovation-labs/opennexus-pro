import { join } from "node:path";

/**
 * Resolves the installed release user config directory path.
 *
 * @param homeDir Temporary HOME path.
 * @returns Installed config directory path.
 */
export function getInstalledConfigDirPath(homeDir: string): string {
  return join(homeDir, ".config", "nexus");
}
