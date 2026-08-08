import { spawnSync } from "node:child_process";

/**
 * Sends text to an agent via `herdr agent send-text`, then sends Enter
 * to submit it.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param text      The text to send.
 * @returns Process exit code.
 */
export async function runSubagentSendCommand(agentName: string, text: string): Promise<number> {
  if (!agentName) {
    console.error('Usage: nexus subagent send <agent-name> "<text>"');
    return 1;
  }

  console.error(`Sending to agent ${agentName}: ${text}`);

  const textResult = spawnSync("herdr", ["agent", "send-text", agentName, text], {
    encoding: "utf-8",
    timeout: 10_000,
  });

  if (textResult.error || textResult.status !== 0) {
    const output = (textResult.stderr ?? "").toString() || (textResult.stdout ?? "").toString();
    console.error(`send-text failed: status=${textResult.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  console.error("Sending Enter...");
  const enterResult = spawnSync("herdr", ["agent", "send-keys", agentName, "Enter"], {
    encoding: "utf-8",
    timeout: 10_000,
  });

  if (enterResult.error || enterResult.status !== 0) {
    const output = (enterResult.stderr ?? "").toString() || (enterResult.stdout ?? "").toString();
    console.error(`send-keys failed: status=${enterResult.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  console.error("Sent.");
  return 0;
}
