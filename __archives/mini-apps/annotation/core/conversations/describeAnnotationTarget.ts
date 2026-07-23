import type { AnnotationResult } from "@nexus/mini-apps/annotate/types.js";

/**
 * Builds a compact user-facing summary of the submitted annotation target.
 *
 * @param result Annotation result posted by the browser extension.
 * @returns Summary for conversation events.
 */
export function describeAnnotationTarget(result: AnnotationResult): string {
  const count = result.elements?.length ?? 0;
  const prompt = result.prompt?.trim();
  if (prompt) return `${count} annotated element(s): ${prompt}`;
  return `${count} annotated element(s) submitted without a global note.`;
}
