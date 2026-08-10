import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { createRtkCommandCandidates } from "./createRtkCommandCandidates";
import { hasRtkBinary } from "./hasRtkBinary";

/**
 * Finds an executable RTK command, including the default installer path.
 *
 * @param pi Pi extension API.
 * @param cwd Current working directory.
 * @param signal Optional abort signal.
 * @returns RTK command path, if available.
 */
export async function findAvailableRtkCommand(pi: ExtensionAPI, cwd: string, signal?: AbortSignal): Promise<string | undefined> {
  for (const command of createRtkCommandCandidates()) {
    if (await hasRtkBinary(pi, cwd, signal, command)) return command;
  }
  return undefined;
}
