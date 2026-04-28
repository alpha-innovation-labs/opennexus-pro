import type { ServerResponse } from "node:http";

/**
 * Sends a JSON HTTP response.
 *
 * @param response Outgoing HTTP response.
 * @param statusCode HTTP status code.
 * @param payload JSON-serializable payload.
 */
export function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
