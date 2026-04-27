import { buildSessionContext, loadEntriesFromFile } from "../../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/session-manager.js";

export interface ResumeSessionStats {
  humanMessages: number;
  toolCalls: number;
  thinkingBlocks: number;
}

/**
 * Reads one persisted session file and counts the visible conversation summary stats.
 *
 * @param sessionPath Absolute persisted session path.
 * @returns Human, tool, and thinking counts for the active session branch.
 */
export function readResumeSessionStats(sessionPath: string): ResumeSessionStats {
  const entries = loadEntriesFromFile(sessionPath);
  const sessionContext = buildSessionContext(entries as never);

  return sessionContext.messages.reduce<ResumeSessionStats>((stats: ResumeSessionStats, message: any) => {
    if (message.role === "user") {
      stats.humanMessages += 1;
      return stats;
    }
    if (message.role !== "assistant" || !Array.isArray(message.content)) {
      return stats;
    }
    for (const block of message.content) {
      if (!block || typeof block !== "object" || !("type" in block)) continue;
      if (block.type === "toolCall") stats.toolCalls += 1;
      if (block.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
        stats.thinkingBlocks += 1;
      }
    }
    return stats;
  }, { humanMessages: 0, toolCalls: 0, thinkingBlocks: 0 });
}
