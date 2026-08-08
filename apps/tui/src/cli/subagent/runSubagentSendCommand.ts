import { spawnSync } from "node:child_process";

/**
 * Sends text to a pane via `herdr pane send-text`, then sends Enter
 * to submit it.
 *
 * @param paneId The target pane ID (e.g. "w72:p1").
 * @param text The text to send.
 * @returns Process exit code.
 */
export async function runSubagentSendCommand(paneId: string, text: string): Promise<number> {
  if (!paneId) {
    console.error('Usage: nexus subagent send <pane-id> "<text>"');
    return 1;
  }

  console.error(`Sending to pane ${paneId}: ${text}`);

  const textResult = spawnSync("herdr", ["pane", "send-text", paneId, text], {
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
  const enterResult = spawnSync("herdr", ["pane", "send-keys", paneId, "Enter"], {
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
