import { getAgentDirPath } from "./getAgentDirPath.js";

/**
 * Ensures both supported agent-dir environment variables point at the active Nexus config directory.
 *
 * @returns Resolved agent directory path.
 */
export function ensureAgentDirEnv(): string {
  const agentDir = getAgentDirPath();

  if (!process.env.NEXUS_CODING_AGENT_DIR) {
    process.env.NEXUS_CODING_AGENT_DIR = agentDir;
  }

  if (!process.env.PI_CODING_AGENT_DIR) {
    process.env.PI_CODING_AGENT_DIR = agentDir;
  }

  return agentDir;
}
