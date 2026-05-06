import type { AnnotationResult } from "@nexus/mini-apps/annotate/types.js";

/**
 * Extracts the page URL used to group annotation follow-ups.
 *
 * @param result Annotation result posted by the browser extension.
 * @returns Page URL, or a stable unknown bucket.
 */
export function getAnnotationResultUrl(result: AnnotationResult): string {
  return typeof result.url === "string" && result.url.length > 0 ? result.url : "about:unknown";
}
