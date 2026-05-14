import { rm } from "node:fs/promises";
import type { ObservationArtifactGroup } from "./types.js";

/**
 * Deletes all known files for one observation artifact group.
 *
 * @param group Observation artifact group.
 */
export async function deleteObservationArtifactGroup(group: ObservationArtifactGroup): Promise<void> {
  const paths = [group.messagesPath, group.statePath, group.legacyStatePath, group.markdownPath].filter((filePath): filePath is string => Boolean(filePath));
  await Promise.all(paths.map((filePath) => rm(filePath, { force: true })));
}
