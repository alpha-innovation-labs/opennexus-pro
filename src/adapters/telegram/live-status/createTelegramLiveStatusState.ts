import { createInitialThinkingLine } from "./createInitialThinkingLine.js";
import type { TelegramLiveStatusState } from "./types.js";

/**
 * Creates the initial Telegram live-status state.
 *
 * @returns Empty live-status state.
 */
export function createTelegramLiveStatusState(): TelegramLiveStatusState {
  return {
    thinkingLine: createInitialThinkingLine(),
    toolLines: [],
  };
}
