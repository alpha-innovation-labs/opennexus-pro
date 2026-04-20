import { homedir } from "node:os";
import { join } from "node:path";
import { expandHomePath } from "./expandHomePath.js";

const AGENT_DIR_ENV_NAMES = ["NEXUS_CODING_AGENT_DIR", "PI_CODING_AGENT_DIR"];

/**
 * Resolves the active Nexus agent directory.
 *
 * @returns Absolute agent directory path.
 */
export function getAgentDirPath(): string {
  for (const envName of AGENT_DIR_ENV_NAMES) {
    const configuredPath = process.env[envName];
    if (configuredPath) {
      return expandHomePath(configuredPath);
    }
  }

  return join(homedir(), ".nexus", "agent");
}
