import type { ChildProcessWithoutNullStreams } from "node:child_process";

export interface TelegramRpcRequestState {
  requestId: string;
  resolve(text: string): void;
  reject(error: Error): void;
  timeout: NodeJS.Timeout;
  onEvent?: (event: unknown) => void;
}

export interface TelegramRpcSession {
  child: ChildProcessWithoutNullStreams;
  chatId: number;
  queue: Promise<unknown>;
  currentRequest?: TelegramRpcRequestState;
  stderr: string;
}
