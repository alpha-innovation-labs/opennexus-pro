import type { ServerResponse } from "node:http";

/**
 * Writes development-safe CORS headers for local browser-extension APIs.
 *
 * @param response Outgoing HTTP response.
 */
export function writeCorsHeaders(response: ServerResponse): void {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}
