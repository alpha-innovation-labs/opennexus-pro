import type { SubagentRun } from "../types.js";
import { getSubagentRun } from "./getSubagentRun.js";
import { isTerminalSubagentStatus } from "./isTerminalSubagentStatus.js";
import { sleep } from "./sleep.js";

/**
 * Waits for one child run to become idle or reach a terminal persisted status.
 *
 * @param run Target run.
 */
export async function waitForSubagentCompletion(run: SubagentRun): Promise<void> {
  if (run.client) {
    await run.client.waitForIdle(300000);
    return;
  }

  const startedAt = Date.now();
  while (Date.now() - startedAt < 300000) {
    const latestRun = await getSubagentRun(run.id);
    if (!latestRun) throw new Error("Subagent run disappeared while waiting");
    if (latestRun.client) {
      await latestRun.client.waitForIdle(300000);
      return;
    }
    if (isTerminalSubagentStatus(latestRun.status)) return;
    await sleep(100);
  }

  throw new Error("Timed out waiting for subagent completion");
}
