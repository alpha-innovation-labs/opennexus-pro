import type { TelegramRpcRequestState, TelegramRpcSession } from "./types.js";

/**
 * Rejects the active Telegram RPC request and clears its timeout safely.
 *
 * @param session Active Telegram RPC session.
 * @param request Request to reject.
 * @param error Error to return to the caller.
 */
export function rejectTelegramRpcRequest(
	session: TelegramRpcSession,
	request: TelegramRpcRequestState,
	error: Error,
): void {
	clearTimeout(request.timeout);
	session.currentRequest = undefined;
	request.reject(error);
}
