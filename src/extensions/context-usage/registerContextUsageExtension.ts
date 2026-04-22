import { Type } from "@mariozechner/pi-ai";
import { defineTool, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { formatContextUsage } from "./formatContextUsage.js";

/**
 * Registers a tool that reports the current session context-window usage.
 *
 * @param pi Pi extension API.
 */
export function registerContextUsageExtension(pi: ExtensionAPI): void {
  pi.registerTool(
    defineTool({
      name: "context_usage",
      label: "Context Usage",
      description: "Returns the current chat context usage for the active model.",
      promptSnippet: "Inspect the current chat context-window usage.",
      promptGuidelines: [
        "Use context_usage when the user asks how much chat context or context window has been used.",
      ],
      parameters: Type.Object({}),
      async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
        return {
          content: [{ type: "text", text: formatContextUsage(ctx.getContextUsage()) }],
        };
      },
    }),
  );
}
