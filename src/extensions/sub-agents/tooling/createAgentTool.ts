import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { sharedSubagentContextRegistry } from "../ui/sharedSubagentContextRegistry.js";
import { formatSubagentResult } from "../runtime/formatSubagentResult.js";
import { startSubagentRun } from "../runtime/startSubagentRun.js";
import type { SpawnSubagentOptions } from "../types.js";

/**
 * Creates the public Agent tool.
 *
 * @returns Tool definition.
 */
export function createAgentTool() {
  return {
    name: "Agent",
    label: "Agent",
    description: "Launch a new agent to handle complex, multi-step tasks autonomously.",
    renderShell: "self",
    parameters: Type.Object({
      prompt: Type.String({ description: "The task for the agent to perform." }),
      description: Type.String({ description: "A short description of the task." }),
      subagent_type: Type.String({ description: "The type of specialized agent to use." }),
      model: Type.Optional(Type.String({ description: "Optional model override." })),
      thinking: Type.Optional(Type.String({ description: "Optional thinking level override." })),
      max_turns: Type.Optional(Type.Number({ description: "Optional maximum turns." })),
      run_in_background: Type.Optional(Type.Boolean({ description: "Run the agent in background." })),
      inherit_context: Type.Optional(Type.Boolean({ description: "Include parent context." })),
      isolated: Type.Optional(Type.Boolean({ description: "Disable child extensions." })),
      context_providers: Type.Optional(Type.Array(Type.String({ description: "Extra named context providers." }))),
    }),
    renderCall() {
      return new Text("", 0, 0);
    },
    renderResult() {
      return new Text("", 0, 0);
    },
    async execute(_toolCallId: string, params: unknown, _signal: AbortSignal | undefined, _onUpdate: unknown, ctx: any) {
      const input = params as {
        prompt: string;
        description: string;
        subagent_type: string;
        model?: string;
        thinking?: string;
        max_turns?: number;
        run_in_background?: boolean;
        inherit_context?: boolean;
        isolated?: boolean;
        context_providers?: string[];
      };
      const options: SpawnSubagentOptions = {
        description: input.description,
        subagentType: input.subagent_type,
        model: input.model,
        thinking: input.thinking,
        maxTurns: input.max_turns,
        runInBackground: input.run_in_background,
        inheritContext: input.inherit_context,
        isolated: input.isolated,
        contextProviders: input.context_providers,
      };
      const run = await startSubagentRun(ctx, input.prompt, options, sharedSubagentContextRegistry.list());
      if (run.background) {
        return {
          content: [{ type: "text" as const, text: `Started background subagent ${run.id} (${run.title})` }],
        };
      }
      return formatSubagentResult(run);
    },
  };
}
