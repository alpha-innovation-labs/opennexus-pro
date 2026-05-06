import { createInitialThinkingLine } from "./createInitialThinkingLine.js";
import { firstTelegramLine } from "./firstTelegramLine.js";
import { formatTelegramToolCall } from "./formatTelegramToolCall.js";
import type { TelegramLiveStatusState } from "./types.js";

/**
 * Applies one Nexus RPC event to the Telegram live-status state.
 *
 * @param state Mutable live-status state.
 * @param event Parsed Nexus RPC event.
 */
export function applyTelegramLiveStatusEvent(state: TelegramLiveStatusState, event: unknown): void {
  const record = event as {
    type?: string;
    toolName?: string;
    args?: unknown;
    isError?: boolean;
    assistantMessageEvent?: { type?: string; content?: string; delta?: string };
  };

  if (record.type === "agent_start") {
    state.thinkingLine = createInitialThinkingLine();
    return;
  }

  if (record.type === "tool_execution_start" && record.toolName) {
    state.toolLines.push(formatTelegramToolCall(record.toolName, record.args, "running"));
    state.toolLines.splice(0, Math.max(0, state.toolLines.length - 8));
    return;
  }

  if (record.type === "tool_execution_end" && record.toolName) {
    for (let index = state.toolLines.length - 1; index >= 0; index -= 1) {
      if (state.toolLines[index]?.startsWith(`→ ${record.toolName}`) || state.toolLines[index]?.startsWith(`✓ ${record.toolName}`) || state.toolLines[index]?.startsWith(`✗ ${record.toolName}`)) {
        state.toolLines[index] = state.toolLines[index].replace(/^[→✓✗]/, record.isError ? "✗" : "✓");
        return;
      }
    }
    state.toolLines.push(formatTelegramToolCall(record.toolName, record.args, record.isError ? "error" : "done"));
    return;
  }

  if (record.type === "message_update") {
    const assistantEvent = record.assistantMessageEvent;
    if (assistantEvent?.type === "thinking_start") {
      state.thinkingLine = createInitialThinkingLine();
      return;
    }
    if (assistantEvent?.type === "thinking_delta" && assistantEvent.delta) {
      const line = firstTelegramLine(assistantEvent.delta);
      if (line) {
        state.thinkingLine = line.slice(0, 160);
      }
      return;
    }
    if (assistantEvent?.type === "thinking_end") {
      state.thinkingLine = firstTelegramLine(assistantEvent.content)?.slice(0, 160) || state.thinkingLine || createInitialThinkingLine();
    }
  }
}
