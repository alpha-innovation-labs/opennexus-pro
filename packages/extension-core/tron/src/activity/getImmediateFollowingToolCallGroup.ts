type ToolCallContent = { type?: unknown; id?: unknown; text?: unknown; thinking?: unknown };

export interface ImmediateFollowingToolCallGroup {
  toolCallIds: string[];
  followedByThinking: boolean;
}

/**
 * Reads the contiguous tool-call group that immediately follows one thinking block.
 *
 * @param content Assistant message content blocks.
 * @param index Thinking block index.
 * @returns Tool-call ids and whether another thinking block follows that group.
 */
export function getImmediateFollowingToolCallGroup(content: ToolCallContent[], index: number): ImmediateFollowingToolCallGroup {
  const toolCallIds: string[] = [];

  for (let nextIndex = index + 1; nextIndex < content.length; nextIndex++) {
    const next = content[nextIndex];
    if (!next) continue;
    if (next.type === "toolCall") {
      if (typeof next.id === "string" && next.id) toolCallIds.push(next.id);
      continue;
    }
    if (next.type === "thinking" && typeof next.thinking === "string" && next.thinking.trim()) {
      return { toolCallIds, followedByThinking: toolCallIds.length > 0 };
    }
    if (next.type === "text" && typeof next.text === "string" && next.text.trim()) {
      return { toolCallIds, followedByThinking: false };
    }
    if (toolCallIds.length > 0) return { toolCallIds, followedByThinking: false };
  }

  return { toolCallIds, followedByThinking: false };
}
