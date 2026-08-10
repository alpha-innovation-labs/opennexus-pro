import { homedir } from "node:os";
import { join } from "node:path";
import { expandHomePath } from "./expandHomePath";

/**
 * Resolves the Nexus-specific default agent directory.
 * This is the fallback when neither env var is set.
 */
function getNexusAgentDir(): string {
  if (process.env.NEXUS_CODING_AGENT_DIR) {
    return expandHomePath(process.env.NEXUS_CODING_AGENT_DIR);
  }
  return join(homedir(), ".local", "share", "nexus", "agent");
}

const nexusAgentDir = getNexusAgentDir();
const effectiveAgentDir = process.env.PI_CODING_AGENT_DIR || nexusAgentDir;

if (!process.env.NEXUS_CODING_AGENT_DIR) {
  process.env.NEXUS_CODING_AGENT_DIR = effectiveAgentDir;
}

if (!process.env.PI_CODING_AGENT_DIR) {
  process.env.PI_CODING_AGENT_DIR = effectiveAgentDir;
}

/**
 * Returns the resolved Nexus agent directory path.
 * Sets `NEXUS_CODING_AGENT_DIR` and `PI_CODING_AGENT_DIR` env vars
 * at module-load time so all downstream code agrees on the directory.
 *
 * @returns Resolved agent directory path.
 */
export function getNexusAgentDirPath(): string {
  return nexusAgentDir;
}

