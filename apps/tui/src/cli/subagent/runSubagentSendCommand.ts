import { sendTextToAgent } from "@nexus/herdr/herdr-client";

/**
 * Sends text to an agent via `herdr agent send-text`, then sends Enter
 * to submit it.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param text      The text to send.
 * @returns Process exit code.
 */
export async function runSubagentSendCommand(agentName: string, text: string): Promise<number> {
  try {
    console.error(`Sending to agent ${agentName}: ${text}`);
    sendTextToAgent(agentName, text);
    console.error("Sent.");
    return 0;
  } catch (err) {
    const message = (err as Error).message ?? `send failed: status=1`;
    console.error(message);
    return 1;
  }
}
