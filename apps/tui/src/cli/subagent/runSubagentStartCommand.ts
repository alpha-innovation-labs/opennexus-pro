import { spawnSync } from "node:child_process";
import * as crypto from "node:crypto";

/**
 * Runs `nexus subagent start [--session <name>]`: splits the current pane to the right,
 * then starts a `mastracode` agent in that pane via `herdr agent start`.
 *
 * If `--session` is provided, uses that name; otherwise generates a random one.
 *
 * @returns Process exit code.
 */
export async function runSubagentStartCommand(): Promise<number> {
  const raw = process.argv.slice(2).filter((a) => a !== "--");
  const scriptPath = "apps/tui/src/index.ts";
  const cliArgs = raw[0] === scriptPath ? raw.slice(1) : raw;
  const subagentIndex = cliArgs.indexOf("subagent");
  const realArgs = subagentIndex >= 0 ? cliArgs.slice(subagentIndex + 1) : cliArgs;

  let sessionName: string | undefined;
  for (let i = 0; i < realArgs.length; i++) {
    if (realArgs[i] === "--session" && i + 1 < realArgs.length) {
      sessionName = realArgs[i + 1];
      i++;
    }
  }

  if (!sessionName) {
    const randomHex = crypto.randomBytes(4).toString("hex").slice(0, 4);
    sessionName = `agent-${randomHex}`;
  }

  const splitResult = spawnSync("herdr", ["pane", "split", "--current", "--direction", "right"], {
    encoding: "utf-8",
    timeout: 10_000,
  });

  if (splitResult.error || splitResult.status !== 0) {
    const output = (splitResult.stderr ?? "").toString() || (splitResult.stdout ?? "").toString();
    console.error(`Split failed: status=${splitResult.status}`);
    if (output) console.error(output.slice(0, 2000));
    return 1;
  }

  const source = (splitResult.stderr ?? "").toString();
  const parsed = JSON.parse(source.startsWith("{") ? source : (splitResult.stdout ?? "").toString());
  const rightPaneId = parsed.result?.pane?.pane_id as string | undefined;

  if (!rightPaneId) {
    console.error("Error: split did not return a pane_id");
    return 1;
  }

  console.error(`Session: ${sessionName}, Pane: ${rightPaneId}`);

  // Wait for the split pane to be ready before attaching an agent.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const runResult = spawnSync("herdr", [
    "agent",
    "start",
    sessionName,
    "--kind",
    "mastracode",
    "--pane",
    rightPaneId,
  ], {
    stdio: "inherit",
    timeout: 0,
  });

  return runResult.status ?? 0;
}
