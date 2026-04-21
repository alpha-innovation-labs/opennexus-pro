import { randomUUID } from "node:crypto";

/**
 * Creates a short stable identifier for one subagent run.
 *
 * @returns Run identifier.
 */
export function createSubagentRunId(): string {
  return randomUUID().slice(0, 8);
}
