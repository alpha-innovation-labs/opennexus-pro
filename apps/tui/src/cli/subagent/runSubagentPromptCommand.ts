import { spawnSync } from "node:child_process";

/**
 * Runs `nexus subagent prompt <session-id> "<text>"`: sends a prompt to an
 * agent and waits for the response before returning.
 *
 * @param sessionId  The agent session name (e.g. "agent-abc1").
 * @param text       The prompt text to send.
 * @returns Process exit code.
 */
export async function runSubagentPromptCommand(sessionId: string, text: string, timeoutMs?: number): Promise<number> {
  const timeout = timeoutMs ?? 120_000;

  console.error(`Prompting agent '${sessionId}': ${text}`);

  const result = spawnSync("herdr", ["agent", "prompt", sessionId, text, "--wait", "--timeout", String(timeout)], {
    encoding: "utf-8",
    timeout: 0,
  });

  const stderr = (result.stderr ?? "").toString();
  const stdout = (result.stdout ?? "").toString();
  const output = stderr.startsWith("{") ? stderr : stdout;

  if (result.error || result.status !== 0) {
    console.error(`prompt failed: status=${result.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  // Output may be plain text (terminal content) or JSON (error).
  if (output.startsWith("{")) {
    console.log(output);
  } else if (output) {
    console.log(output);
  }

  return 0;
}
