import { appendSteerQueueItem } from "@nexus/extensions/steer-queue/appendSteerQueueItem.js";
import { readSteerCommandInput } from "./readSteerCommandInput.js";

const STEER_COMMAND_USAGE = "Usage: nexus steer <session-id> <message>";

/**
 * Runs the Nexus steering CLI command.
 *
 * @param argv Raw CLI arguments.
 * @returns Process exit code.
 */
export async function runSteerCommand(argv: readonly string[]): Promise<number> {
  const input = readSteerCommandInput(argv);
  if (!input.sessionId || !input.message) {
    console.error(STEER_COMMAND_USAGE);
    return 1;
  }

  try {
    await appendSteerQueueItem(input.sessionId, input.message);
    console.log(`Queued steer for session ${input.sessionId}`);
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}
