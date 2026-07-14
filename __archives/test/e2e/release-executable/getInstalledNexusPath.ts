import { join } from "node:path";

/**
 * Resolves the launcher path for an isolated release install.
 *
 * @param homeDir Temporary HOME path.
 * @returns Installed Nexus launcher path.
 */
export function getInstalledNexusPath(homeDir: string): string {
  return join(homeDir, ".local", "bin", "nexus");
}
