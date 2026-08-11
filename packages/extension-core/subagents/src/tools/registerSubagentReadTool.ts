import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { runHerdr } from "@nexus/herdr/herdr-client";

/**
 * Registers the `subagent_read` tool — reads terminal output from an agent
 * via `herdr agent read`.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentReadTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "subagent_read",
    label: "Subagent Read",
    description:
      "Read terminal output from an agent via herdr agent read.",
    promptSnippet:
      "Read terminal output from a subagent",
    parameters: Type.Object({
      agentName: Type.String({ description: "The target agent name (e.g. 'agent-abc1')." }),
      lines: Type.Optional(Type.Number({ description: "Optional number of lines to read." })),
      source: Type.Optional(Type.String({ description: "Optional source: 'visible' or 'recent'." })),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        const args = ["agent", "read", params.agentName];
        if (params.lines !== undefined) {
          args.push("--lines", String(params.lines));
        }
        if (params.source) {
          args.push("--source", params.source);
        }

        const result = runHerdr(args, { timeoutMs: 10_000 });

        // Output may be plain text (terminal content) or JSON (error).
        const text = typeof result === "object" && result !== null && "_raw" in result
          ? String((result as Record<string, unknown>)._raw)
          : JSON.stringify(result);

        return {
          content: [{ type: "text", text: text || "" }],
          details: { agentName: params.agentName },
        };
      } catch (err) {
        const message = (err as Error).message ?? `Read failed: status=1`;
        return {
          content: [{ type: "text", text: `Read failed: status=1` }],
          details: { error: message.slice(0, 500) },
        };
      }
    },
  }));
}
