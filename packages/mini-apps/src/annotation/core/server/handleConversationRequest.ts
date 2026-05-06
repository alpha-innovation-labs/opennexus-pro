import type { ServerResponse } from "node:http";
import { getAnnotationConversationByUrl } from "../conversations/getAnnotationConversationByUrl.js";
import { sendJson } from "./sendJson.js";

/**
 * Handles lookup of the active annotation conversation for a page URL.
 *
 * @param requestUrl Raw request URL.
 * @param response Outgoing HTTP response.
 */
export async function handleConversationRequest(requestUrl: string, response: ServerResponse): Promise<void> {
  const url = new URL(requestUrl, "http://localhost").searchParams.get("url") ?? "";
  const conversation = url ? await getAnnotationConversationByUrl(url) : null;
  sendJson(response, 200, { conversation });
}
