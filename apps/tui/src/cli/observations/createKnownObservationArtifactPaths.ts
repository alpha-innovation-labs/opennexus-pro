import { join } from "node:path";
import { getObservationsDir } from "@nexus/extensions/observations/shared/getObservationsDir.js";

/**
 * Resolves all known observation artifact paths for a conversation id.
 *
 * @param conversationId Session-derived observation conversation id.
 * @returns Current and legacy observation artifact paths.
 */
export function createKnownObservationArtifactPaths(conversationId: string): string[] {
  const observationsDir = getObservationsDir();
  return [
    join(observationsDir, `${conversationId}.json`),
    join(observationsDir, `${conversationId}.messages.json`),
    join(observationsDir, `${conversationId}.state.json`),
    join(observationsDir, `${conversationId}.observations.md`),
  ];
}
