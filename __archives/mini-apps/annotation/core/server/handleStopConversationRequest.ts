import type { ServerResponse } from "node:http";
import { stopAnnotationAgentConversation } from "../agent/stopAnnotationAgentConversation.js";
import { getAnnotationConversationById } from "../conversations/getAnnotationConversationById.js";
import { sendError } from "./sendError.js";
import { sendJson } from "./sendJson.js";

/**
 * Handles a stop request for an annotation conversation.
 *
 * @param conversationId Conversation id to stop.
 * @param response Outgoing HTTP response.
 */
export async function handleStopConversationRequest(conversationId: string, response: ServerResponse): Promise<void> {
  const conversation = await getAnnotationConversationById(conversationId);
  if (!conversation) {
    sendError(response, 404, "Conversation not found");
    return;
  }

  await stopAnnotationAgentConversation(conversation);
  sendJson(response, 202, { conversationId: conversation.id });
}
