import { join } from "node:path";

/**
 * Resolves the globally installed Nexus package directory for release tests.
 *
 * @param homeDir Temporary HOME path.
 * @returns Installed package directory path.
 */
export function getInstalledPackageDirPath(homeDir: string): string {
  return join(homeDir, ".local", "lib", "node_modules", "opennexus");
}
