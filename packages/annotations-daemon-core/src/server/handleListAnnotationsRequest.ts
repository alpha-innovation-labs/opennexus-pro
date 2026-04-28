import type { ServerResponse } from "node:http";
import { listAnnotations } from "../store/listAnnotations.js";
import type { StoredAnnotationStatus } from "../store/types.js";
import { sendJson } from "./sendJson.js";

const statuses = new Set(["pending", "claimed", "resolved"]);

/**
 * Handles annotation list requests.
 *
 * @param requestUrl Raw request URL.
 * @param response Outgoing HTTP response.
 */
export async function handleListAnnotationsRequest(requestUrl: string, response: ServerResponse): Promise<void> {
  const status = new URL(requestUrl, "http://localhost").searchParams.get("status");
  const filter = status && statuses.has(status) ? status as StoredAnnotationStatus : undefined;
  sendJson(response, 200, { annotations: await listAnnotations(filter) });
}
