import { join } from "node:path";

/**
 * Resolves the installed release agent directory path.
 *
 * @param homeDir Temporary HOME path.
 * @returns Installed agent directory path.
 */
export function getInstalledAgentDirPath(homeDir: string): string {
  return join(homeDir, ".local", "share", "nexus", "agent");
}
