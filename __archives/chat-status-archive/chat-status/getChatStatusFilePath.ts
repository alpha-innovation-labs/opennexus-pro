import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { join } from "node:path";

const CHAT_STATUS_PATH_ENV = "NEXUS_CHAT_STATUS_PATH";

/**
 * Resolves the shared chat-status file path.
 *
 * @returns Absolute chat-status file path.
 */
export function getChatStatusFilePath(): string {
  return process.env[CHAT_STATUS_PATH_ENV]?.trim() || join(getAgentDirPath(), "chat-status.json");
}
