import type { Run } from "@cursor/sdk";
import { writeAssistantBlocks } from "./writeAssistantBlocks.js";

/**
 * Streams a Cursor SDK run to stdout and prints its final status.
 *
 * @param run Cursor SDK run returned by agent.send().
 */
export async function streamRunOutput(run: Run): Promise<void> {
  for await (const event of run.stream()) {
    writeAssistantBlocks(event);
  }

  const result = await run.wait();
  process.stdout.write(`\n\n[cursor-sdk] status=${result.status} durationMs=${result.durationMs ?? "unknown"}\n`);
}
