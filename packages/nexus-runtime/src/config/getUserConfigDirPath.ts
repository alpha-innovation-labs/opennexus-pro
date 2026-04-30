import { homedir } from "node:os";
import { join } from "node:path";
import { expandHomePath } from "./expandHomePath.js";

const USER_CONFIG_DIR_ENV_NAME = "NEXUS_CONFIG_DIR";

/**
 * Resolves the Nexus user config directory.
 *
 * @returns Absolute path to the user config directory.
 */
export function getUserConfigDirPath(): string {
  const configuredPath = process.env[USER_CONFIG_DIR_ENV_NAME];
  if (configuredPath) {
    return expandHomePath(configuredPath);
  }

  return join(homedir(), ".config", "nexus");
}
