import { join } from "node:path";
import { homedir } from "node:os";

/**
 * Returns the default RTK install path used by the official Unix installer.
 *
 * @returns Absolute default RTK executable path.
 */
export function getRtkDefaultInstallPath(): string {
  return join(homedir(), ".local", "bin", "rtk");
}
