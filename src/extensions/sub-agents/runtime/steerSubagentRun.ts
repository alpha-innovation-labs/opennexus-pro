import { getSubagentRun } from "./getSubagentRun.js";

/**
 * Sends a steering message to one running child subagent.
 *
 * @param runId Run identifier.
 * @param message Steering message.
 */
export async function steerSubagentRun(runId: string, message: string): Promise<void> {
  const run = await getSubagentRun(runId);
  if (!run?.client) {
    throw new Error("Subagent is not currently running in this process");
  }
  await run.client.steer(message);
}
