import { appendSubagentTranscriptEntry } from "./appendSubagentTranscriptEntry.js";
import { persistSubagentRun } from "./persistSubagentRun.js";
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

  const steeringMessage = message.trim();
  if (!steeringMessage) return;

  appendSubagentTranscriptEntry(run, { role: "user", text: steeringMessage });
  persistSubagentRun(run);

  if (!run.client) {
    run.pendingSteers = [...(run.pendingSteers ?? []), steeringMessage];
    persistSubagentRun(run);
    return;
  }
  await run.client.steer(steeringMessage);
}
