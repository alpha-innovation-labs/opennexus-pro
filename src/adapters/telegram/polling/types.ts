import type { TelegramInboundMessage, TelegramUpdate } from "../runtime/types.js";

export interface TelegramPollingConfig {
  allowedUserIds: Set<string>;
}

export interface TelegramPollingDependencies {
  editStatusMessage(chatId: number, messageId: number, text: string): Promise<void>;
  getUpdates(offset: number): Promise<TelegramUpdate[]>;
  readOffset(): Promise<number>;
  runAgentTurn(message: TelegramInboundMessage, onEvent?: (event: unknown) => void): Promise<string>;
  sendMessage(chatId: number, text: string): Promise<void>;
  sendStatusMessage(chatId: number, text: string): Promise<number>;
  sendTyping(chatId: number): Promise<void>;
  writeOffset(offset: number): Promise<void>;
}
