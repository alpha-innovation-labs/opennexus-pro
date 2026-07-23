import type { ServerResponse } from "node:http";
import { writeCorsHeaders } from "./writeCorsHeaders.js";

/**
 * Handles CORS preflight requests for local annotation APIs.
 *
 * @param response Outgoing HTTP response.
 */
export function handleOptionsRequest(response: ServerResponse): void {
  writeCorsHeaders(response);
  response.writeHead(204);
  response.end();
}
