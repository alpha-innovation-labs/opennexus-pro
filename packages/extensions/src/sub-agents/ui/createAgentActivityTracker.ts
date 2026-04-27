import type { AgentSession } from "@mariozechner/pi-coding-agent";
import type { ToolActivity } from "../agent-runner.js";
import { formatTokens, type AgentActivity } from "./agent-widget.js";

/**
 * Safely formats session token usage for subagent activity state.
 *
 * @param session Optional agent session.
 * @returns Compact token text or an empty string.
 */
function safeFormatTokens(session: { getSessionStats(): { tokens: { total: number } } } | undefined): string {
  if (!session) return "";
  try {
    return formatTokens(session.getSessionStats().tokens.total);
  } catch {
    return "";
  }
}

/**
 * Creates widget activity state and callback handlers for one subagent run.
 *
 * @param maxTurns Optional max-turn limit.
 * @param onStreamUpdate Callback triggered after any live-state update.
 * @returns Mutable state plus event callbacks.
 */
export function createAgentActivityTracker(
  maxTurns?: number,
  onStreamUpdate?: () => void,
): {
  state: AgentActivity;
  callbacks: {
    onToolActivity: (activity: ToolActivity) => void;
    onTextDelta: (delta: string, fullText: string) => void;
    onThinkingDelta: (delta: string, fullText: string) => void;
    onTurnEnd: (turnCount: number) => void;
    onSessionCreated: (session: AgentSession) => void;
  };
} {
  const state: AgentActivity = {
    activeTools: new Map(),
    toolUses: 0,
    turnCount: 1,
    maxTurns,
    tokens: "",
    responseText: "",
    thinkingText: "",
    session: undefined,
  };

  return {
    state,
    callbacks: {
      onToolActivity: (activity: ToolActivity) => {
        if (activity.type === "start") {
          state.activeTools.set(activity.toolCallId, {
            toolCallId: activity.toolCallId,
            toolName: activity.toolName,
            args: activity.args,
            outputText: "",
          });
        } else if (activity.type === "update") {
          const existing = state.activeTools.get(activity.toolCallId);
          if (existing) {
            existing.outputText = activity.outputText ?? existing.outputText;
            state.activeTools.set(activity.toolCallId, existing);
          }
        } else {
          state.activeTools.delete(activity.toolCallId);
          state.toolUses += 1;
        }

        state.tokens = safeFormatTokens(state.session);
        onStreamUpdate?.();
      },
      onTextDelta: (_delta: string, fullText: string) => {
        state.responseText = fullText;
        onStreamUpdate?.();
      },
      onThinkingDelta: (_delta: string, fullText: string) => {
        state.thinkingText = fullText;
        onStreamUpdate?.();
      },
      onTurnEnd: (turnCount: number) => {
        state.turnCount = turnCount;
        onStreamUpdate?.();
      },
      onSessionCreated: (session: AgentSession) => {
        state.session = session;
      },
    },
  };
}
