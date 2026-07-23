import { join } from "node:path";
import { ensureSubagentStorageDir } from "./ensureSubagentStorageDir.js";

/**
 * Resolves the persisted JSON path for one subagent run.
 *
 * @param runId Run identifier.
 * @returns Absolute JSON file path.
 */
export function getSubagentRunFilePath(runId: string): string {
  return join(ensureSubagentStorageDir(), `${runId}.json`);
}
