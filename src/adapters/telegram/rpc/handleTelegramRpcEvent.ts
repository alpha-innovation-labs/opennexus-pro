import { extractAssistantTextFromAgentEndEvent } from "../runtime/extractAssistantTextFromAgentEndEvent.js";
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
    clearTimeout(currentRequest.timeout);
    session.currentRequest = undefined;
    currentRequest.reject(new Error(record.error ?? "Nexus RPC prompt request failed"));
    return;
  }

  if (record.type === "agent_end") {
    clearTimeout(currentRequest.timeout);
    session.currentRequest = undefined;
    currentRequest.resolve(extractAssistantTextFromAgentEndEvent(record));
  }
}
