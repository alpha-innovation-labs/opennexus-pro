import { claimPendingAnnotation } from "@nexus/annotations-daemon-core/client/claimPendingAnnotation.js";
import { Type } from "@sinclair/typebox";

/**
 * Creates the tool that locks one pending annotation for a worker/chat.
 *
 * @returns Pi tool definition.
 */
export function createClaimAnnotationTool() {
  return {
    name: "claim_annotation",
    label: "Claim Annotation",
    description: "Lock a pending annotation before working on it so another chat does not take it.",
    parameters: Type.Object({
      annotationId: Type.String({ description: "Annotation id returned by read_pending_annotations." }),
      owner: Type.String({ description: "Stable identifier for the chat or worker claiming the annotation." }),
    }),
    async execute(_toolCallId: string, params: unknown) {
      const { annotationId, owner } = params as { annotationId: string; owner: string };
      const annotation = await claimPendingAnnotation(annotationId, owner);
      return { content: [{ type: "text" as const, text: `Claimed annotation ${annotation.id} for ${owner}.` }], details: { annotation } };
    },
  };
}
