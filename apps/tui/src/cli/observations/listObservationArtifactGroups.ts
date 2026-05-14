import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getObservationSessionId } from "./getObservationSessionId.js";
import type { ObservationArtifactGroup } from "./types.js";

/**
 * Lists grouped observation artifacts in the storage directory.
 *
 * @param observationsDir Observation storage directory.
 * @returns Observation artifact groups sorted by conversation id.
 */
export async function listObservationArtifactGroups(observationsDir: string): Promise<ObservationArtifactGroup[]> {
  let fileNames: string[];
  try {
    fileNames = await readdir(observationsDir);
  } catch {
    return [];
  }

  const groups = new Map<string, ObservationArtifactGroup>();
  for (const fileName of fileNames) {
    const match = /^(.*)\.(messages\.json|state\.json|observations\.md)$/.exec(fileName);
    if (!match) continue;
    const conversationId = match[1]!;
    const group = groups.get(conversationId) ?? { conversationId, sessionId: getObservationSessionId(conversationId) };
    const filePath = join(observationsDir, fileName);
    if (match[2] === "messages.json") group.messagesPath = filePath;
    if (match[2] === "state.json") group.statePath = filePath;
    if (match[2] === "observations.md") group.markdownPath = filePath;
    groups.set(conversationId, group);
  }

  return [...groups.values()].sort((left, right) => left.conversationId.localeCompare(right.conversationId));
}
