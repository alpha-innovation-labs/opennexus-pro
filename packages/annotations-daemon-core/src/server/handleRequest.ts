import type { IncomingMessage, ServerResponse } from "node:http";
import { handleAnnotationsRequest } from "./handleAnnotationsRequest.js";
import { handleHealthRequest } from "./handleHealthRequest.js";
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
    if (pathname === "/health") {
      handleHealthRequest(response);
      return;
    }
    if (await handleAnnotationsRequest(request, response)) return;
    sendError(response, 404, "Not found");
  } catch (error) {
    sendError(response, 400, error instanceof Error ? error.message : String(error));
  }
}
