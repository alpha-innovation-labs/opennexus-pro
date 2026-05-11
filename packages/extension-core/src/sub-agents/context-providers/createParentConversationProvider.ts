import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { extractMessageText } from "./extractMessageText.js";
import type { SubagentContextProvider } from "./types.js";

/**
 * Builds the serialized parent conversation block for child prompts.
 *
 * @param ctx Extension runtime context.
 * @returns Serialized parent conversation context.
 */
function buildParentConversationContext(ctx: ExtensionContext): string {
  const entries = ctx.sessionManager.getBranch();
  if (!entries.length) return "";

  const parts: string[] = [];
  for (const entry of entries) {
    if (entry.type === "message") {
      const message = entry.message;
      if (message.role === "user") {
        const text = typeof message.content === "string" ? message.content : extractMessageText(message.content);
        if (text.trim()) parts.push(`[User]: ${text.trim()}`);
      }
      if (message.role === "assistant") {
        const text = extractMessageText(message.content);
        if (text.trim()) parts.push(`[Assistant]: ${text.trim()}`);
      }
    }
    if (entry.type === "compaction" && entry.summary) {
      parts.push(`[Summary]: ${entry.summary}`);
    }
  }

  if (!parts.length) return "";
  return [
    "# Parent Conversation Context",
    "The following is the conversation history from the parent session that spawned you.",
    "Use this context to understand what has been discussed and decided so far.",
    "",
    parts.join("\n\n"),
  ].join("\n");
}

/**
 * Creates the default parent-conversation context provider.
 *
 * @returns Context provider.
 */
export function createParentConversationProvider(): SubagentContextProvider {
  return {
    id: "parent-conversation",
    async provide({ ctx }) {
      return buildParentConversationContext(ctx);
    },
  };
}
