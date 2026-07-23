import type { StoredAnnotation } from "@nexus/mini-apps/annotation/core/store/types.js";

/**
 * Formats one stored annotation as a compact markdown summary.
 *
 * @param annotation Stored annotation record.
 * @returns Markdown summary.
 */
export function formatStoredAnnotationSummary(annotation: StoredAnnotation): string {
  const url = annotation.result.url ?? "Unknown URL";
  const count = annotation.result.elements?.length ?? 0;
  const feedback = annotation.result.elements?.map((element, index) => `${index + 1}. ${element.comment || "No feedback"}`).join("; ") ?? "No feedback";
  return `- ${annotation.id} — ${url} — ${count} element(s) — ${feedback}`;
}
