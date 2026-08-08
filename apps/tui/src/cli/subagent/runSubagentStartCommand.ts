import { spawnSync } from "node:child_process";

/**
 * Runs `nexus subagent start`: splits the current pane to the right,
 * extracts the new pane ID from the split output, then launches
 * `nexus` in that pane via `herdr pane run`.
 *
 * @returns Process exit code.
 */
export async function runSubagentStartCommand(): Promise<number> {
  const splitResult = spawnSync("herdr", ["pane", "split", "--current", "--direction", "right"], {
    encoding: "utf-8",
    timeout: 10_000,
  });

  if (splitResult.error || splitResult.status !== 0) {
    const output = (splitResult.stderr ?? "").toString() || (splitResult.stdout ?? "").toString();
    console.error(`Split failed: status=${splitResult.status}`);
    if (output) console.error(output.slice(0, 500));
    return 1;
  }

  const source = (splitResult.stderr ?? "").toString();
  const parsed = JSON.parse(source.startsWith("{") ? source : (splitResult.stdout ?? "").toString());
  const rightPaneId = parsed.result?.pane?.pane_id as string | undefined;

  if (!rightPaneId) {
    console.error("Error: split did not return a pane_id");
    return 1;
  }

  console.error(`New pane: ${rightPaneId}`);

  const runResult = spawnSync("herdr", ["pane", "run", rightPaneId, "nexus"], {
    stdio: "inherit",
    timeout: 0,
  });

  return runResult.status ?? 0;
}
