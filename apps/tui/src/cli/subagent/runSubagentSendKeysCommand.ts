import { spawnSync } from "node:child_process";

/**
 * Sends key presses to a pane via `herdr pane send-keys`.
 *
 * @param paneId The target pane ID (e.g. "w72:p1").
 * @param keys Key names to send (space-separated: "Enter", "Esc", "Ctrl+c").
 * @returns Process exit code.
 */
export async function runSubagentSendKeysCommand(paneId: string, keys: string[]): Promise<number> {
  if (!paneId || keys.length === 0) {
    console.error('Usage: nexus subagent send-keys <pane-id> <keys...>');
    return 1;
  }

  console.error(`Sending keys to pane ${paneId}: ${keys.join(", ")}`);

  const result = spawnSync("herdr", ["pane", "send-keys", paneId, ...keys], {
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
