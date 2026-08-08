import { spawnSync } from "node:child_process";

/**
 * Reads terminal output from an agent via `herdr agent read`.
 *
 * @param agentName The target agent name (e.g. "agent-abc1").
 * @param options Read options (lines, source).
 * @returns Process exit code.
 */
export async function runSubagentReadCommand(
  agentName: string,
  options: { lines?: string; source?: string } = {},
): Promise<number> {
  if (!agentName) {
    console.error("Usage: nexus subagent read <agent-name> [--lines N] [--source visible|recent]");
    return 1;
  }

  const args = ["agent", "read", agentName];
  if (options.lines) args.push("--lines", options.lines);
  if (options.source) args.push("--source", options.source);

  const result = spawnSync("herdr", args, {
    encoding: "utf-8",
    timeout: 10_000,
  });

  const stderr = (result.stderr ?? "").toString();
  const stdout = (result.stdout ?? "").toString();
  const output = stderr.startsWith("{") ? stderr : stdout;

  if (result.error || result.status !== 0) {
    console.error(`read failed: status=${result.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  // Output may be plain text (terminal content) or JSON (error).
  // If it starts with "{", print it; otherwise print raw text.
  if (output.startsWith("{")) {
    console.log(output);
  } else if (output) {
    console.log(output);
  }

  return 0;
}
