import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { getConfig } from "../agent-types.js";
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
    skipLeadingSpacer: true,
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
      mode: Type.Optional(Type.String({ description: "Optional mode accepted by the target subagent, such as implementation, e2e, qa, setup, or merge." })),
      brief: Type.Optional(Type.String({ description: "Structured context brief or handoff content for the subagent." })),
    }),
    renderCall(args: unknown, theme: any) {
      const input = args as { subagent_type?: string; description?: string; run_in_background?: boolean };
      const displayName = getConfig(input.subagent_type ?? "Librarian").displayName;
      const asyncLabel = input.run_in_background ? theme.fg("warning", " [async]") : "";
      const description = input.description ? `  ${theme.fg("muted", input.description)}` : "";
      return new Text(`▸ ${theme.fg("toolTitle", theme.bold(displayName))}${asyncLabel}${description}`, 0, 0);
    },
    renderResult(result: any, _state: any, theme: any) {
      const text = result?.content?.find?.((part: any) => part?.type === "text")?.text ?? "";
      if (!text.trim()) return new Text("", 0, 0);
      if (text.startsWith("Started background subagent ")) {
        return new Text(theme.fg("dim", `  ⎿  ${text}`), 0, 0);
      }
      return new Text(text, 0, 0);
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
        mode?: string;
        brief?: string;
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
        mode: input.mode,
        brief: input.brief,
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
