import { spawnSync } from "node:child_process";

/**
 * Reads terminal output from a pane via `herdr pane read`.
 *
 * @param paneId The target pane ID (e.g. "w72:p1").
 * @param options Read options (lines, source).
 * @returns Process exit code.
 */
export async function runSubagentReadCommand(
  paneId: string,
  options: { lines?: string; source?: string } = {},
): Promise<number> {
  if (!paneId) {
    console.error("Usage: nexus subagent read <pane-id> [--lines N] [--source visible|recent]");
    return 1;
  }

  const args = ["pane", "read", paneId];
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
