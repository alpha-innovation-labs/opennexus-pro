import type { ServerResponse } from "node:http";
import { sendJson } from "./sendJson.js";

/**
 * Handles daemon health checks.
 *
 * @param response Outgoing HTTP response.
 */
export function handleHealthRequest(response: ServerResponse): void {
  sendJson(response, 200, { ok: true });
}
