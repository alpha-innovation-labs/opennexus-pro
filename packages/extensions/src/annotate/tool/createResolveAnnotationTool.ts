import { resolvePendingAnnotation } from "@nexus/annotations-daemon-core/client/resolvePendingAnnotation.js";
import { Type } from "@sinclair/typebox";

/**
 * Creates the tool that marks one annotation as resolved.
 *
 * @returns Pi tool definition.
 */
export function createResolveAnnotationTool() {
  return {
    name: "resolve_annotation",
    label: "Resolve Annotation",
    description: "Mark a claimed annotation as resolved after the requested change is complete.",
    parameters: Type.Object({
      annotationId: Type.String({ description: "Annotation id to resolve." }),
      owner: Type.String({ description: "Same owner used when the annotation was claimed." }),
    }),
    async execute(_toolCallId: string, params: unknown) {
      const { annotationId, owner } = params as { annotationId: string; owner: string };
      const annotation = await resolvePendingAnnotation(annotationId, owner);
      return { content: [{ type: "text" as const, text: `Resolved annotation ${annotation.id}.` }], details: { annotation } };
    },
  };
}
