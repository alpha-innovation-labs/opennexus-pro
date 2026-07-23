import type { TelegramRpcSession } from "./types.js";

/**
 * In-memory Telegram RPC sessions keyed by chat id.
 */
export const telegramRpcSessions = new Map<number, TelegramRpcSession>();
