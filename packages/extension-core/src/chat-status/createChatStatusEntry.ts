import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createChatStatusEntryId } from "./createChatStatusEntryId.js";
import type { ChatStatusEntry } from "./types.js";

/**
 * Creates the chat-status entry for the active Nexus chat.
 *
 * @param ctx Extension context for the active session.
 * @param startedAt ISO timestamp for when the chat started running.
 * @returns Chat-status entry for persistence.
 */
export function createChatStatusEntry(ctx: ExtensionContext, startedAt: string): ChatStatusEntry {
  const sessionTitle = ctx.sessionManager.getSessionName()?.trim();

  return {
    id: createChatStatusEntryId(ctx),
    sessionId: ctx.sessionManager.getSessionId(),
    sessionFile: ctx.sessionManager.getSessionFile(),
    sessionTitle: sessionTitle || undefined,
    cwd: ctx.cwd,
    pid: process.pid,
    startedAt,
    updatedAt: startedAt,
  };
}
