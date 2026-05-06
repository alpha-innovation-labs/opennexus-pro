import type { IncomingMessage, ServerResponse } from "node:http";
import { runAnnotationAgentTurn } from "../agent/runAnnotationAgentTurn.js";
import { shouldRunAnnotationAgent } from "../agent/shouldRunAnnotationAgent.js";
import { upsertAnnotationConversation } from "../conversations/upsertAnnotationConversation.js";
import { addAnnotation } from "../store/addAnnotation.js";
import { readRequestJson } from "./readRequestJson.js";
import { sendJson } from "./sendJson.js";

/**
 * Handles creation of one pending annotation.
 *
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 */
export async function handleCreateAnnotationRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  const result = await readRequestJson(request);
  const annotation = await addAnnotation(result as never);
  const conversation = await upsertAnnotationConversation(annotation.id, annotation.result);
  if (shouldRunAnnotationAgent()) void runAnnotationAgentTurn(conversation, annotation);
  sendJson(response, 201, { annotation, conversation });
}
