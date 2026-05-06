import type { ServerResponse } from "node:http";
import { sendJson } from "./sendJson.js";

/**
 * Sends a standardized JSON error response.
 *
 * @param response Outgoing HTTP response.
 * @param statusCode HTTP status code.
 * @param error Error message.
 */
export function sendError(response: ServerResponse, statusCode: number, error: string): void {
  sendJson(response, statusCode, { error });
}
