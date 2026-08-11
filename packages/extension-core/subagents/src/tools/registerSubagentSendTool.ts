import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { sendTextToAgent } from "@nexus/herdr";

/**
 * Registers the `subagent_send` tool — sends text to an agent and then
 * sends Enter to submit it.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentSendTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "subagent_send",
    label: "Subagent Send",
    description:
      "Send text to an agent via herdr agent send-text, then send Enter to submit.",
    promptSnippet:
      "Send text to a subagent and submit it",
    parameters: Type.Object({
      agentName: Type.String({ description: "The target agent name (e.g. 'agent-abc1')." }),
      text: Type.String({ description: "The text to send." }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        sendTextToAgent(params.agentName, params.text);
        return {
          content: [{ type: "text", text: "Sent." }],
          details: { agentName: params.agentName, text: params.text },
        };
      } catch (err) {
        const message = (err as Error).message ?? `Send-text failed: status=1`;
        return {
          content: [{ type: "text", text: `Send failed: status=1` }],
          details: { error: message.slice(0, 500) },
        };
      }
    },
  }));
}
