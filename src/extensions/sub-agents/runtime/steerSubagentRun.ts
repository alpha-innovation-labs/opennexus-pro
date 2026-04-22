import { getSubagentRun } from "./getSubagentRun.js";

/**
 * Sends a steering message to one running child subagent.
 *
 * @param runId Run identifier.
 * @param message Steering message.
 */
export async function steerSubagentRun(runId: string, message: string): Promise<void> {
  const run = await getSubagentRun(runId);
  if (!run) {
    throw new Error("Unknown subagent id");
  }
  if (!run.client) {
    run.pendingSteers = [...(run.pendingSteers ?? []), message];
    return;
  }
  await run.client.steer(message);
}
