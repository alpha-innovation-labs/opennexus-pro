import { buildTelegramApiUrl } from "./buildTelegramApiUrl.js";

export interface TelegramApiResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

/**
 * Calls a Telegram Bot API method.
 *
 * @param token Telegram bot token.
 * @param method Bot API method name.
 * @param body Optional JSON request body.
 * @returns Parsed Telegram API result.
 */
export async function callTelegramApi<T>(token: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(buildTelegramApiUrl(token, method), {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await response.json()) as TelegramApiResponse<T>;

  if (!response.ok || !payload.ok) {
    throw new Error(payload.description ?? `Telegram API request failed: ${response.status}`);
  }

  return payload.result;
}
