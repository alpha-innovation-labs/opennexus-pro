import type { TranscriptEntry } from "@extensions/tron/transcript/types.js";
import { getMessageCreatedAt } from "./getMessageCreatedAt.js";

/**
 * Converts one assistant session message into Tron-style transcript entries.
 *
 * @param message Persisted assistant message.
 * @returns Transcript entries preserving assistant block order.
 */
export function toAssistantTranscriptEntries(message: {
  content?: unknown;
  errorMessage?: string;
  stopReason?: string;
  timestamp?: unknown;
}): TranscriptEntry[] {
  const createdAt = getMessageCreatedAt(message);
  if (!Array.isArray(message.content)) {
    return message.errorMessage
      ? [{ role: "error", text: message.errorMessage, createdAt }]
      : [];
  }

  const entries: TranscriptEntry[] = [];
  for (const block of message.content) {
    if (!block || typeof block !== "object" || !("type" in block)) continue;
    if (block.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
      entries.push({ role: "thinking", text: block.thinking, createdAt });
      continue;
    }
    if (block.type === "text" && typeof block.text === "string" && block.text.trim()) {
      entries.push({ role: "assistant", text: block.text, createdAt });
      continue;
    }
    if (block.type === "toolCall") {
      entries.push({
        role: "tool",
        text: "",
        createdAt,
        toolCallId: typeof block.id === "string" ? block.id : `tool-${createdAt}`,
        toolName: typeof block.name === "string" ? block.name : "tool",
        args: typeof block.arguments === "object" && block.arguments !== null ? block.arguments as Record<string, unknown> : {},
      });
    }
  }

  if (entries.length > 0) return entries;
  if (message.stopReason === "aborted") return [{ role: "assistant", text: "(aborted)", createdAt }];
  if (message.errorMessage) return [{ role: "error", text: message.errorMessage, createdAt }];
  return [];
}
