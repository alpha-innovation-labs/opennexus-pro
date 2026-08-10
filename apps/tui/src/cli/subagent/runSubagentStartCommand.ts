import { splitPaneRight, startForegroundAgent } from "@nexus/herdr/herdr-client";

/**
 * Runs `nexus subagent start [--session <name>]`: splits the current pane to the right,
 * then starts a `mastracode` agent in that pane via `herdr agent start`.
 *
 * If `--session` is provided, uses that name; otherwise generates a random one.
 *
 * @returns Process exit code.
 */
export async function runSubagentStartCommand(sessionName?: string): Promise<number> {
  try {
    const paneId = splitPaneRight();
    console.error(`Session: ${sessionName}, Pane: ${paneId}`);

    // Wait for the split pane to be ready before attaching an agent.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return startForegroundAgent(sessionName ?? "agent-unnamed", paneId);
  } catch (err) {
    const message = (err as Error).message ?? `Split failed: status=1`;
    console.error(message);
    return 1;
  }
}
