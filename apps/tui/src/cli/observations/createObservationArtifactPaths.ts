import { getObservationMessagesPath } from "@nexus/extensions-pro/observations/shared/getObservationMessagesPath.js";
import { getObservationStatePath } from "@nexus/extensions-pro/observations/shared/getObservationStatePath.js";
import { getObservationsMarkdownPath } from "@nexus/extensions-pro/observations/shared/getObservationsMarkdownPath.js";

/**
 * Resolves observation artifact paths for one conversation id.
 *
 * @param conversationId Observation conversation id.
 * @returns Messages, state, and markdown paths.
 */
export function createObservationArtifactPaths(conversationId: string): {
  messagesPath: string;
  statePath: string;
  markdownPath: string;
} {
  return {
    messagesPath: getObservationMessagesPath(conversationId),
    statePath: getObservationStatePath(conversationId),
    markdownPath: getObservationsMarkdownPath(conversationId),
  };
}
