import type { SubagentRun } from "../types.js";

/**
 * Waits for one child run to become idle.
 *
 * @param run Target run.
 */
export async function waitForSubagentCompletion(run: SubagentRun): Promise<void> {
  if (!run.client) {
    throw new Error("Subagent client not initialized");
  }
  await run.client.waitForIdle(300000);
}
