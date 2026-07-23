import type { TelegramRpcRequestState, TelegramRpcSession } from "./types.js";

/**
 * Resolves the active Telegram RPC request and clears its timeout safely.
 *
 * @param session Active Telegram RPC session.
 * @param request Request to resolve.
 * @param text Final assistant text.
 */
export function resolveTelegramRpcRequest(
	session: TelegramRpcSession,
	request: TelegramRpcRequestState,
	text: string,
): void {
	clearTimeout(request.timeout);
	session.currentRequest = undefined;
	request.resolve(text);
}
