import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { handleChatStatusAgentEnd } from "./handleChatStatusAgentEnd.js";
import { handleChatStatusAgentStart } from "./handleChatStatusAgentStart.js";
import { handleChatStatusSessionShutdown } from "./handleChatStatusSessionShutdown.js";

/**
 * Registers the chat-status lifecycle extension.
 *
 * @param pi Pi extension API.
 */
export function registerChatStatusExtension(pi: ExtensionAPI): void {
  pi.on("agent_start", handleChatStatusAgentStart);
  pi.on("agent_end", handleChatStatusAgentEnd);
  pi.on("session_shutdown", handleChatStatusSessionShutdown);
}
