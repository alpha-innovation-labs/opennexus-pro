import { createInitialThinkingLine } from "./createInitialThinkingLine.js";

/**
 * Creates the initial Telegram live-status text.
 *
 * @returns Initial live-status message text.
 */
export function createInitialTelegramLiveStatusText(): string {
  return `- ${createInitialThinkingLine()}`;
}
