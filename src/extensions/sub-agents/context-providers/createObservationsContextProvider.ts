import { getCurrentConversationId } from "../../observations/shared/getCurrentConversationId.js";
import { getObservationStatePath } from "../../observations/shared/getObservationStatePath.js";
import { readObservationState } from "../../observations/tracker/readObservationState.js";
import type { SubagentContextProvider } from "./types.js";

/**
 * Creates the observations-backed subagent context provider.
 *
 * @returns Context provider.
 */
export function createObservationsContextProvider(): SubagentContextProvider {
  return {
    id: "observations",
    async provide({ ctx }) {
      const conversationId = getCurrentConversationId(ctx);
      if (!conversationId) return "";
      const statePath = getObservationStatePath(conversationId);
      const state = await readObservationState(
        statePath,
        conversationId,
        ctx.cwd,
        ctx.sessionManager.getSessionFile(),
      );
      if (!state.topics.length) return "";
      const lines = state.topics.map((topic) => {
        const bullets = topic.assistantBullets.map((bullet) => `- ${bullet}`).join("\n");
        return [`## ${topic.title}`, bullets].filter(Boolean).join("\n");
      });
      return ["# Observations Context", ...lines].join("\n\n");
    },
  };
}
