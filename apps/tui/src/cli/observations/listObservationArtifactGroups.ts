import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { getObservationSessionId } from "./getObservationSessionId";
import type { ObservationArtifactGroup } from "./types";

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
    const parsed = parseObservationArtifactFileName(fileName);
    if (!parsed) continue;
    const group = groups.get(parsed.conversationId) ?? { conversationId: parsed.conversationId, sessionId: getObservationSessionId(parsed.conversationId) };
    const filePath = join(observationsDir, fileName);
    if (parsed.kind === "messages") group.messagesPath = filePath;
    if (parsed.kind === "state") group.statePath = filePath;
    if (parsed.kind === "legacy-state") group.legacyStatePath = filePath;
    if (parsed.kind === "markdown") group.markdownPath = filePath;
    groups.set(parsed.conversationId, group);
  }

  return [...groups.values()].sort((left, right) => left.conversationId.localeCompare(right.conversationId));
}

/**
 * Parses an observation artifact filename.
 *
 * @param fileName Artifact filename.
 * @returns Parsed conversation id and kind.
 */
function parseObservationArtifactFileName(fileName: string): { conversationId: string; kind: "messages" | "state" | "legacy-state" | "markdown" } | undefined {
  const legacyMatch = /^(.*)\.(messages\.json|state\.json|observations\.md)$/.exec(fileName);
  if (legacyMatch) {
    const suffix = legacyMatch[2];
    const kind = suffix === "messages.json" ? "messages" : suffix === "state.json" ? "legacy-state" : "markdown";
    return { conversationId: legacyMatch[1]!, kind };
  }
  const currentMatch = /^(.*)\.json$/.exec(fileName);
  if (!currentMatch) return undefined;
  return { conversationId: currentMatch[1]!, kind: "state" };
}
