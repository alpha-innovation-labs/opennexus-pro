import { getObservationStatePath } from "@extensions/observations/shared/getObservationStatePath";

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
