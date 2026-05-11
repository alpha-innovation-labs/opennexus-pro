import { Text } from "@earendil-works/pi-tui";
import { Type } from "@sinclair/typebox";
import { formatSubagentResult } from "../runtime/formatSubagentResult.js";
import { getSubagentRun } from "../runtime/getSubagentRun.js";
import { waitForSubagentCompletion } from "../runtime/waitForSubagentCompletion.js";

/**
 * Creates the status lookup tool for background subagents.
 *
 * @returns Tool definition.
 */
export function createGetSubagentResultTool() {
  return {
    name: "get_subagent_result",
    label: "get_subagent_result",
    description: "Check status and retrieve results from a background agent.",
    renderShell: "self",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent ID to check." }),
      wait: Type.Optional(Type.Boolean({ description: "Wait for completion before returning." })),
    }),
    renderCall() {
      return new Text("", 0, 0);
    },
    renderResult() {
      return new Text("", 0, 0);
    },
    async execute(_toolCallId: string, params: unknown) {
      const input = params as { agent_id: string; wait?: boolean };
      const run = await getSubagentRun(input.agent_id);
      if (!run) {
        return { content: [{ type: "text" as const, text: `Unknown subagent id: ${input.agent_id}` }] };
      }
      if (input.wait && run.client) {
        await waitForSubagentCompletion(run);
      }
      return formatSubagentResult(run);
    },
  };
}
