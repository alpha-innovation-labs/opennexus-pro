import type { IncomingMessage, ServerResponse } from "node:http";
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
  sendJson(response, 201, { annotation });
}
