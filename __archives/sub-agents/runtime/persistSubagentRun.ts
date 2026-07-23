import type { SubagentRun } from "../types.js";
import { writeSubagentRunSnapshot } from "./writeSubagentRunSnapshot.js";

/**
 * Persists a run snapshot without surfacing write failures.
 *
 * @param run Target run.
 */
export function persistSubagentRun(run: SubagentRun): void {
  void writeSubagentRunSnapshot(run).catch(() => {});
}
