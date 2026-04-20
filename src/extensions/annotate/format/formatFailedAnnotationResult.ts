import type { AnnotationResult } from "../types.js";

/**
 * Formats an unsuccessful annotation result.
 *
 * @param result Annotation result.
 * @returns Human-readable failure text.
 */
export function formatFailedAnnotationResult(result: AnnotationResult): string {
  if (result.cancelled) {
    if (result.reason?.includes("Another terminal")) {
      return `Annotation session ended: ${result.reason}`;
    }
    if (result.reason && result.reason !== "user") {
      return `Annotation cancelled: ${result.reason}`;
    }
    return "Annotation cancelled by user.";
  }

  return `Annotation failed: ${result.reason || "Unknown error"}`;
}
