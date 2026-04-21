let telegramRpcRequestCounter = 0;

/**
 * Creates a unique RPC request id for Telegram prompts.
 *
 * @param chatId Telegram chat id.
 * @returns RPC request id.
 */
export function createTelegramRpcRequestId(chatId: number): string {
  telegramRpcRequestCounter += 1;
  return `telegram-${String(chatId)}-${String(telegramRpcRequestCounter)}`;
}
