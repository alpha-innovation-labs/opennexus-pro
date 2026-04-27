import { Text } from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";
import { steerSubagentRun } from "../runtime/steerSubagentRun.js";

/**
 * Creates the steering tool for active background subagents.
 *
 * @returns Tool definition.
 */
export function createSteerSubagentTool() {
  return {
    name: "steer_subagent",
    label: "steer_subagent",
    description: "Send a steering message to a running subagent.",
    renderShell: "self",
    parameters: Type.Object({
      agent_id: Type.String({ description: "The agent ID to steer." }),
      message: Type.String({ description: "The steering message." }),
    }),
    renderCall() {
      return new Text("", 0, 0);
    },
    renderResult() {
      return new Text("", 0, 0);
    },
    async execute(_toolCallId: string, params: unknown) {
      const input = params as { agent_id: string; message: string };
      await steerSubagentRun(input.agent_id, input.message);
      return { content: [{ type: "text" as const, text: `Steered subagent ${input.agent_id}` }] };
    },
  };
}
