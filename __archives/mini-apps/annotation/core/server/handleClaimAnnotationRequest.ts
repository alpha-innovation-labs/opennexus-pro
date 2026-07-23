import type { IncomingMessage, ServerResponse } from "node:http";
import { claimAnnotation } from "../locks/claimAnnotation.js";
import { parseOwner } from "./parseOwner.js";
import { readRequestJson } from "./readRequestJson.js";
import { sendJson } from "./sendJson.js";

/**
 * Handles claim requests for one annotation.
 *
 * @param annotationId Annotation identifier.
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 */
export async function handleClaimAnnotationRequest(annotationId: string, request: IncomingMessage, response: ServerResponse): Promise<void> {
  const owner = parseOwner(await readRequestJson(request));
  sendJson(response, 200, { annotation: await claimAnnotation(annotationId, owner) });
}
