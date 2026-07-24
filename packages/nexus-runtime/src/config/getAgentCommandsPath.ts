import { existsSync } from "node:fs";
import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent/dist/config.js";

/**
 * Resolves the agent commands directory path.
 *
 * @returns Absolute path to `~/.local/share/nexus/agent/commands`.
 */
export function getAgentCommandsPath(): string {
  return join(getAgentDir(), "commands");
}

/**
 * Checks whether the agent commands directory exists on disk.
 *
 * @returns `true` if `~/.local/share/nexus/agent/commands` exists.
 */
export function agentCommandsExists(): boolean {
  return existsSync(getAgentCommandsPath());
}
