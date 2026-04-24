import { readFile } from "node:fs/promises";
import type { SubagentRun } from "../types.js";
import { getSubagentRunFilePath } from "./getSubagentRunFilePath.js";

/**
 * Reads one persisted background run snapshot.
 *
 * @param runId Run identifier.
 * @returns Persisted run state, if found.
 */
export async function readPersistedSubagentRun(runId: string): Promise<SubagentRun | undefined> {
  try {
    const content = await readFile(getSubagentRunFilePath(runId), "utf8");
    const snapshot = JSON.parse(content) as Partial<SubagentRun>;
    return {
      ...(snapshot as SubagentRun),
      cwd: snapshot.cwd ?? "",
      parentSessionFile: snapshot.parentSessionFile ?? undefined,
      client: null,
    };
  } catch {
    return undefined;
  }
}
