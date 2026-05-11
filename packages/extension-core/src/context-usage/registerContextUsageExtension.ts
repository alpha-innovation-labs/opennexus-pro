import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { withSlashMenuGroup } from "../slash-menu/withSlashMenuGroup.js";
import { getContextUsageToolText } from "./getContextUsageToolText.js";
import { setLatestSystemPromptOptions } from "./contextUsageState.js";
import { showContextUsageCommand } from "./showContextUsageCommand.js";

/**
 * Registers context usage tool and /context command.
 *
 * @param pi Pi extension API.
 */
export function registerContextUsageExtension(pi: ExtensionAPI): void {
  pi.on("before_agent_start", (event) => {
    setLatestSystemPromptOptions(event.systemPromptOptions);
  });

  pi.registerCommand("context", withSlashMenuGroup({
    description: "Show current context-window usage",
    handler: async (_args, ctx) => {
      await showContextUsageCommand(ctx);
    },
  }, "Extensions"));

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
          content: [{ type: "text", text: await getContextUsageToolText(ctx) }],
          details: undefined,
        };
      },
    }),
  );
}
