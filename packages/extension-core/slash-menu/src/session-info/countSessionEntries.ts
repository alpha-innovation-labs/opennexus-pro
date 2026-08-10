export type SessionEntryCounts = {
  total: number;
  user: number;
  assistant: number;
  toolResult: number;
  thinking: number;
};

/**
 * Counts key entry and message types in the current session.
 *
 * @param entries Session entries.
 * @returns Session entry counts.
 */
export function countSessionEntries(entries: Array<{ type?: string; message?: { role?: string; content?: unknown } }>): SessionEntryCounts {
  const counts: SessionEntryCounts = { total: entries.length, user: 0, assistant: 0, toolResult: 0, thinking: 0 };
  for (const entry of entries) {
    if (entry.type !== "message") continue;
    if (entry.message?.role === "user") counts.user += 1;
    if (entry.message?.role === "assistant") {
      counts.assistant += 1;
      counts.thinking += countThinkingBlocks(entry.message.content);
    }
    if (entry.message?.role === "toolResult") counts.toolResult += 1;
  }
  return counts;
}

/**
 * Counts thinking blocks in assistant content.
 *
 * @param content Assistant message content.
 * @returns Thinking block count.
 */
function countThinkingBlocks(content: unknown): number {
  if (!Array.isArray(content)) return 0;
  return content.filter((block) => !!block && typeof block === "object" && (block as { type?: unknown }).type === "thinking").length;
}
