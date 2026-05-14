import type { AgentEndEvent, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { unregisterCurrentChatStatus } from "./unregisterCurrentChatStatus.js";

/**
 * Handles chat-status cleanup when an agent run ends.
 *
 * @param _event Agent end event.
 * @param ctx Extension context for the active session.
 */
export async function handleChatStatusAgentEnd(_event: AgentEndEvent, ctx: ExtensionContext): Promise<void> {
  await unregisterCurrentChatStatus(ctx);
}
