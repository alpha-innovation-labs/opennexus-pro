import { getAgentDir } from "@earendil-works/pi-coding-agent/dist/config.js";
import { homedir } from "node:os";
import { join } from "node:path";
import { expandHomePath } from "./expandHomePath.js";

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
 * Ensures both supported agent-dir environment variables point at the active Nexus config directory.
 *
 * @returns Resolved agent directory path.
 */
export function ensureAgentDirEnv(): string {
  return nexusAgentDir;
}
