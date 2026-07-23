import type { AgentStartEvent, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { registerCurrentChatStatus } from "./registerCurrentChatStatus.js";

/**
 * Handles chat-status registration when an agent run starts.
 *
 * @param _event Agent start event.
 * @param ctx Extension context for the active session.
 */
export async function handleChatStatusAgentStart(_event: AgentStartEvent, ctx: ExtensionContext): Promise<void> {
  await registerCurrentChatStatus(ctx);
}
