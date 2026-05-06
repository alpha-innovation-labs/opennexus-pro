import type { ServerResponse } from "node:http";
import { writeCorsHeaders } from "./writeCorsHeaders.js";

/**
 * Sends a JSON HTTP response.
 *
 * @param response Outgoing HTTP response.
 * @param statusCode HTTP status code.
 * @param payload JSON-serializable payload.
 */
export function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  writeCorsHeaders(response);
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}
