import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAnnotationsRequest } from "./handleAnnotationsRequest.js";
import { handleConversationRequest } from "./handleConversationRequest.js";
import { handleHealthRequest } from "./handleHealthRequest.js";
import { handleOptionsRequest } from "./handleOptionsRequest.js";
import { sendError } from "./sendError.js";

/**
 * Handles one annotations daemon HTTP request.
 *
 * @param request Incoming HTTP request.
 * @param response Outgoing HTTP response.
 */
export async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    if (request.method === "OPTIONS") {
      handleOptionsRequest(response);
      return;
    }
    if (pathname === "/health") {
      handleHealthRequest(response);
      return;
    }
    if (pathname === "/annotation-conversation" && request.method === "GET") {
      await handleConversationRequest(request.url ?? "/annotation-conversation", response);
      return;
    }
    if (await handleAnnotationsRequest(request, response)) return;
    sendError(response, 404, "Not found");
  } catch (error) {
    sendError(response, 400, error instanceof Error ? error.message : String(error));
  }
}
