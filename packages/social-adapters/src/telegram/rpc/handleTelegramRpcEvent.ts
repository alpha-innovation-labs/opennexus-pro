import { extractAssistantTextFromAgentEndEvent } from "../runtime/extractAssistantTextFromAgentEndEvent.js";
import { rejectTelegramRpcRequest } from "./rejectTelegramRpcRequest.js";
import { resolveTelegramRpcRequest } from "./resolveTelegramRpcRequest.js";
import type { TelegramRpcSession } from "./types.js";

/**
 * Handles a parsed Nexus RPC stdout event.
 *
 * @param session Active Telegram RPC session.
 * @param event Parsed RPC event.
 */
export function handleTelegramRpcEvent(session: TelegramRpcSession, event: unknown): void {
  const record = event as { type?: string; id?: string; success?: boolean; error?: string; messages?: unknown[] };
  const currentRequest = session.currentRequest;
  if (!currentRequest) {
    return;
  }

  currentRequest.onEvent?.(event);

  if (record.type === "response" && record.id === currentRequest.requestId && record.success === false) {
    rejectTelegramRpcRequest(session, currentRequest, new Error(record.error ?? "Nexus RPC prompt request failed"));
    return;
  }

  if (record.type === "agent_end") {
    try {
      resolveTelegramRpcRequest(session, currentRequest, extractAssistantTextFromAgentEndEvent(record));
    } catch (error) {
      rejectTelegramRpcRequest(
        session,
        currentRequest,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}
