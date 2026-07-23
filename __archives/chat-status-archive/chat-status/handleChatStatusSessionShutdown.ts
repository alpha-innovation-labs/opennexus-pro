import type { ExtensionContext, SessionShutdownEvent } from "@earendil-works/pi-coding-agent";
import { unregisterCurrentChatStatus } from "./unregisterCurrentChatStatus.js";

/**
 * Handles chat-status cleanup when the session runtime shuts down.
 *
 * @param _event Session shutdown event.
 * @param ctx Extension context for the active session.
 */
export async function handleChatStatusSessionShutdown(_event: SessionShutdownEvent, ctx: ExtensionContext): Promise<void> {
  await unregisterCurrentChatStatus(ctx);
}
