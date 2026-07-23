import { getObservationStatePath } from "@nexus/extensions/observations/shared/getObservationStatePath.js";

/**
 * Resolves the single observation state path for one conversation id.
 *
 * @param conversationId Observation conversation id.
 * @returns State path.
 */
export function createObservationArtifactPaths(conversationId: string): {
  statePath: string;
} {
  return {
    statePath: getObservationStatePath(conversationId),
  };
}
