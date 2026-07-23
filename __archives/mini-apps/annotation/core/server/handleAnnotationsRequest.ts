import type { IncomingMessage, ServerResponse } from "node:http";
import { handleClaimAnnotationRequest } from "./handleClaimAnnotationRequest.js";
import { handleCreateAnnotationRequest } from "./handleCreateAnnotationRequest.js";
import { handleListAnnotationsRequest } from "./handleListAnnotationsRequest.js";
import { handleResolveAnnotationRequest } from "./handleResolveAnnotationRequest.js";
import { routeAnnotationMutation } from "./routeAnnotationMutation.js";
import { sendError } from "./sendError.js";

/**
 * Handles all annotation API routes.
 *
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 * @returns True when the route was handled.
 */
export async function handleAnnotationsRequest(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  const url = new URL(request.url ?? "/", "http://localhost");
  if (url.pathname === "/annotations" && request.method === "POST") {
    await handleCreateAnnotationRequest(request, response);
    return true;
  }
  if (url.pathname === "/annotations" && request.method === "GET") {
    await handleListAnnotationsRequest(request.url ?? "/annotations", response);
    return true;
  }

  const mutationRoute = routeAnnotationMutation(url.pathname);
  if (!mutationRoute || request.method !== "POST") return false;
  if (mutationRoute.action === "claim") await handleClaimAnnotationRequest(mutationRoute.annotationId, request, response);
  else await handleResolveAnnotationRequest(mutationRoute.annotationId, request, response);
  return true;
}
