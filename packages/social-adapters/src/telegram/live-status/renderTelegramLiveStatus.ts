import type { TelegramLiveStatusState } from "./types.js";

/**
 * Renders the Telegram live-status state as markdown-like text.
 *
 * @param state Live-status state.
 * @returns Rendered status text.
 */
export function renderTelegramLiveStatus(state: TelegramLiveStatusState): string {
  const lines = [`- ${state.thinkingLine}`];

  for (const toolLine of state.toolLines) {
    lines.push(`  - ${toolLine}`);
  }

  return lines.join("\n");
}
