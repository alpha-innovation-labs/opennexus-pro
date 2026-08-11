import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { sendKeysToAgent } from "@nexus/herdr/herdr-client";

/**
 * Registers the `subagent_send_keys` tool — sends key presses to an agent
 * via `herdr agent send-keys`.
 *
 * @param pi Pi extension API.
 */
export function registerSubagentSendKeysTool(pi: ExtensionAPI): void {
  pi.registerTool(defineTool({
    name: "subagent_send_keys",
    label: "Subagent Send Keys",
    description:
      "Send key presses (e.g. Enter, Esc) to a subagent.",
    promptSnippet:
      "Send key presses to a subagent",
    parameters: Type.Object({
      agentName: Type.String({ description: "The target agent name (e.g. 'agent-abc1')." }),
      keys: Type.Array(Type.String(), { description: "Key presses to send (e.g. 'Enter', 'Esc')." }),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      try {
        sendKeysToAgent(params.agentName, ...params.keys);
        return {
          content: [{ type: "text", text: "Keys sent." }],
          details: { agentName: params.agentName, keys: params.keys },
        };
      } catch (err) {
        const message = (err as Error).message ?? `Send-keys failed: status=1`;
        return {
          content: [{ type: "text", text: `Send-keys failed: status=1` }],
          details: { error: message.slice(0, 500) },
        };
      }
    },
  }));
}
