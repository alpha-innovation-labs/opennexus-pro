import { countTelegramChangedLines } from "./countTelegramChangedLines.js";
import { formatToolArgs } from "./formatToolArgs.js";

/**
 * Formats one tool call for Telegram live status.
 *
 * @param toolName Tool name.
 * @param args Tool arguments.
 * @param status Tool status marker.
 * @returns Formatted tool-call line.
 */
export function formatTelegramToolCall(toolName: string, args: unknown, status: "running" | "done" | "error"): string {
  const marker = status === "running" ? "→" : status === "error" ? "✗" : "✓";
  const stats = toolName === "edit"
    ? countTelegramChangedLines(args as { edits?: Array<{ oldText?: string; newText?: string }>; oldText?: string; newText?: string })
    : toolName === "write"
      ? { added: typeof (args as { content?: unknown })?.content === "string" ? (args as { content: string }).content.split("\n").length : 0, removed: 0 }
      : undefined;
  const statsText = stats ? ` (+${String(stats.added)} -${String(stats.removed)})` : "";
  const argText = formatToolArgs(args);
  return `${marker} ${toolName}${statsText}${argText ? ` — ${argText}` : ""}`;
}
