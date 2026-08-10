import { toolActivityFrameCursor, toolCallBottomBorderIds, toolCallFrameSyncedIds, toolCallTopBorderIds } from "./state";

type AssistantContent = { type?: unknown; id?: unknown; name?: unknown; text?: unknown; thinking?: unknown };

type VisibleActivity = { kind: "thinking" } | { kind: "tool"; id: string };

/**
 * Synchronizes compact tool-call frame borders from assistant content order.
 *
 * @param content Assistant message content blocks.
 */
export function syncToolCallFrameState(content: AssistantContent[]): void {
  const visibleActivities: VisibleActivity[] = [];

  for (const block of content) {
    if (block?.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
      visibleActivities.push({ kind: "thinking" });
      continue;
    }
    if (block?.type === "toolCall" && block.name !== "Agent" && typeof block.id === "string" && block.id) {
      visibleActivities.push({ kind: "tool", id: block.id });
    }
  }

  const first = visibleActivities[0];
  for (const [index, activity] of visibleActivities.entries()) {
    if (activity.kind !== "tool") continue;
    const wasAlreadySynced = toolCallFrameSyncedIds.has(activity.id);
    const previousActivity = visibleActivities[index - 1];
    const nextActivity = visibleActivities[index + 1];

    toolCallFrameSyncedIds.add(activity.id);

    if (previousActivity) {
      toolCallTopBorderIds.delete(activity.id);
    } else if (!wasAlreadySynced) {
      if (activity === first && toolActivityFrameCursor.lastToolCallId) {
        toolCallTopBorderIds.delete(activity.id);
        toolCallBottomBorderIds.delete(toolActivityFrameCursor.lastToolCallId);
      } else if (activity === first) {
        toolCallTopBorderIds.add(activity.id);
      } else {
        toolCallTopBorderIds.delete(activity.id);
      }
    }

    if (!nextActivity || nextActivity.kind === "thinking") toolCallBottomBorderIds.add(activity.id);
    else toolCallBottomBorderIds.delete(activity.id);
    toolActivityFrameCursor.lastToolCallId = activity.id;
  }
}
