import { appendSubagentTranscriptEntry } from "./appendSubagentTranscriptEntry.js";
import { persistSubagentRun } from "./persistSubagentRun.js";
import { getSubagentRun } from "./getSubagentRun.js";

/**
 * Sends one steering message to a child subagent.
 *
 * Active runs receive a steer; idle or completed runs receive a fresh prompt so the same conversation continues.
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

  if (run.status === "running") {
    await run.client.steer(steeringMessage);
    return;
  }

  await run.client.prompt(steeringMessage);
}
