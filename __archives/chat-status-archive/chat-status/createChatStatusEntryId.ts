import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Creates the stable active-chat entry id for the current process and session.
 *
 * @param ctx Extension context for the active session.
 * @returns Stable chat-status entry id.
 */
export function createChatStatusEntryId(ctx: ExtensionContext): string {
  return `${process.pid}:${ctx.sessionManager.getSessionId()}`;
}
