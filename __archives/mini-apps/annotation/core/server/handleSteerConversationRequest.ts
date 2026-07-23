import type { IncomingMessage, ServerResponse } from "node:http";
import { steerAnnotationAgentConversation } from "../agent/steerAnnotationAgentConversation.js";
import { getAnnotationConversationById } from "../conversations/getAnnotationConversationById.js";
import { readRequestJson } from "./readRequestJson.js";
import { sendError } from "./sendError.js";
import { sendJson } from "./sendJson.js";

/**
 * Handles a user steering message for an annotation conversation.
 *
 * @param conversationId Conversation id to steer.
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 */
export async function handleSteerConversationRequest(
  conversationId: string,
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> {
  const conversation = await getAnnotationConversationById(conversationId);
  if (!conversation) {
    sendError(response, 404, "Conversation not found");
    return;
  }

  const body = await readRequestJson(request) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message : "";
  await steerAnnotationAgentConversation(conversation, message);
  sendJson(response, 202, { conversationId: conversation.id });
}
