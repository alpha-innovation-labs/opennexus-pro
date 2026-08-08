import { spawnSync } from "node:child_process";

/**
 * Sends key presses to an agent via `herdr agent send-keys`.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param keys      Key presses (e.g. "Enter", "Esc").
 * @returns Process exit code.
 */
export async function runSubagentSendKeysCommand(agentName: string, keys: string[]): Promise<number> {
  if (!agentName || keys.length === 0) {
    console.error('Usage: nexus subagent send-keys <agent-name> <keys...>');
    return 1;
  }

  console.error(`Sending keys to agent ${agentName}: ${keys.join(", ")}`);

  const result = spawnSync("herdr", ["agent", "send-keys", agentName, ...keys], {
    encoding: "utf-8",
    timeout: 10_000,
  });

  if (result.error || result.status !== 0) {
    const output = (result.stderr ?? "").toString() || (result.stdout ?? "").toString();
    console.error(`send-keys failed: status=${result.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  console.error("Keys sent.");
  return 0;
}
